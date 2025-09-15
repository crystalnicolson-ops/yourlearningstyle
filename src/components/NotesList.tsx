import { useState, useEffect } from "react";
import { FileText, Download, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestNotes, deleteGuestNote, updateGuestNote } from "@/lib/guestNotes";
import LearningStyleTransform from "./LearningStyleTransform";
import GeminiTextManipulator from "./GeminiTextManipulator";
import SimpleTransform from "./SimpleTransform";

interface Note {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

const NotesList = ({ refreshTrigger, onNotesLoaded }: { refreshTrigger: number; onNotesLoaded?: (noteCount: number) => void }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [transformedContent, setTransformedContent] = useState<Record<string, { content: string; style: string }>>({});
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsGuest(true);
        const guest = getGuestNotes();
        const mapped: Note[] = guest.map((g) => ({
          id: g.id,
          title: g.title,
          content: g.content,
          file_url: g.file_data_url,
          file_name: g.file_name,
          file_type: g.file_type,
          created_at: g.created_at,
          updated_at: g.updated_at,
        }));
        setNotes(mapped);
        onNotesLoaded?.(mapped.length);
        return;
      }

      setIsGuest(false);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
      onNotesLoaded?.(data?.length || 0);
    } catch (error: any) {
      toast({
        title: "Failed to load notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      if (fileUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (noteId: string, fileUrl: string | null) => {
    try {
      if (isGuest) {
        deleteGuestNote(noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast({ title: "Note deleted" });
        return;
      }

      // Delete file from storage if it exists
      if (fileUrl) {
        const filePath = fileUrl.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('notes')
            .remove([filePath]);
        }
      }

      // Delete note from database
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      });

      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleTransformed = (noteId: string, content: string, style: string) => {
    setTransformedContent(prev => ({
      ...prev,
      [noteId]: { content, style }
    }));
  };

  const extractTextForNote = async (note: Note) => {
    try {
      toast({ title: 'Extracting text...', description: note.file_name || undefined });
      const { data, error } = await supabase.functions.invoke('extract-file-text', {
        body: {
          fileUrl: note.file_url,
          fileType: note.file_type,
          fileName: note.file_name,
        },
      });
      if (error) throw error;
      const extracted = (data?.extractedText || '').trim();
      if (!extracted) {
        toast({ title: 'No text found', description: 'Could not extract text from the file.', variant: 'destructive' });
        return;
      }

      if (isGuest) {
        updateGuestNote(note.id, { content: extracted });
      } else {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ content: extracted })
          .eq('id', note.id);
        if (updateError) throw updateError;
      }

      setNotes(prev => prev.map(n => (n.id === note.id ? { ...n, content: extracted } : n)));
      toast({ title: 'Text extracted', description: 'You can now transform this note.' });
    } catch (err: any) {
      console.error('Extract failed:', err);
      toast({ title: 'Extraction failed', description: err.message || 'Unable to extract text', variant: 'destructive' });
    }
  };
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="text-center text-muted-foreground">Loading notes...</div>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No notes uploaded yet. Upload your first note above!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notes with Learning Transformation */}
      <div className="space-y-4">
        {notes.map((note) => {
          const isExpanded = expandedNotes.has(note.id);
          const hasContent = note.content && note.content.trim().length > 0;
          const transformed = transformedContent[note.id];
          
          return (
            <Card key={note.id} className="p-4 bg-gradient-card shadow-card border-0">
              <div className="flex items-start justify-between flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{note.title}</h4>
                    {hasContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(note.id)}
                        className="p-1 h-auto"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  
                  {note.content && !isExpanded && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {note.content}
                    </p>
                  )}
                  
                  {note.file_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <FileText className="h-4 w-4" />
                      <span>{note.file_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>

                  {!hasContent && note.file_url && (
                    <div className="flex items-center justify-between gap-3 text-xs mb-3">
                      <span className="text-muted-foreground">
                        {note.file_name?.toLowerCase().endsWith('.pdf')
                          ? 'PDF uploaded — text extraction not supported yet'
                          : note.file_name?.toLowerCase().endsWith('.doc')
                          ? 'Legacy .doc is not supported — please re-save as .docx'
                          : note.file_name?.toLowerCase().endsWith('.docx')
                          ? 'DOCX detected — click Extract text to process'
                          : 'File uploaded — click Extract text to process'}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => extractTextForNote(note)}
                      >
                        Extract text
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded content section */}
              {isExpanded && hasContent && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <h5 className="font-medium text-sm text-foreground mb-2">Original Content</h5>
                    <div className="bg-muted/50 p-3 rounded text-sm text-muted-foreground whitespace-pre-wrap">
                      {note.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Simple Transform Options */}
              {hasContent && (
                <div className="mt-4">
                  <SimpleTransform
                    content={note.content || ""}
                    onTransformed={(content, type) => handleTransformed(note.id, content, type)}
                  />
                </div>
              )}

              {transformed && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm text-foreground mb-2">
                    Adapted for {transformed.style.charAt(0).toUpperCase() + transformed.style.slice(1)} Learning
                  </h5>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded text-sm text-foreground whitespace-pre-wrap">
                    {transformed.content}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Files List */}
      {notes.length > 0 && (
        <Card className="p-4 bg-gradient-card shadow-card border-0">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Files ({notes.length})
          </h3>
          
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={`file-${note.id}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm text-foreground">{note.title}</div>
                    {note.file_name && (
                      <div className="text-xs text-muted-foreground">{note.file_name}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {note.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(note.file_url!, note.file_name!)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note.id, note.file_url)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotesList;