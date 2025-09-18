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
  const [extractingNotes, setExtractingNotes] = useState<Set<string>>(new Set());
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

  // Auto-extract text for files that support it (no manual click required)
  useEffect(() => {
    const toExtract = notes.filter((n) => n.file_url && !n.content && isExtractableType(n) && !extractingNotes.has(n.id));
    if (toExtract.length === 0) return;

    toExtract.forEach((n) => {
      setExtractingNotes((prev) => new Set(prev).add(n.id));
      extractTextForNote(n).finally(() => {
        setExtractingNotes((prev) => {
          const next = new Set(prev);
          next.delete(n.id);
          return next;
        });
      });
    });
  }, [notes]);

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

const isExtractableType = (note: Note) => {
  const name = (note.file_name || '').toLowerCase();
  const type = (note.file_type || '').toLowerCase();
  return (
    name.endsWith('.docx') ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.json') ||
    type.includes('officedocument.wordprocessingml.document') ||
    type.startsWith('text/') ||
    type.includes('json')
  );
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
            <Card key={note.id} className="p-4 sm:p-4 bg-gradient-card shadow-card border-0">
              <div className="flex items-start justify-between flex-wrap">
                <div className="flex-1">
                  {hasContent && (
                    <div className="flex justify-start mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(note.id)}
                        className="p-2 h-auto min-h-[44px] min-w-[44px]"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </div>
                  )}
                  
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
                          ? (extractingNotes.has(note.id) ? 'DOCX detected — extracting text…' : 'DOCX detected — processing automatically')
                          : (extractingNotes.has(note.id) ? 'Processing file…' : 'File uploaded — processing automatically')}
                      </span>
                      {extractingNotes.has(note.id) && (
                        <span className="text-primary">Processing…</span>
                      )}
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

              {transformed && !['enhanced', 'flashcards', 'audio'].includes(transformed.style) && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm text-foreground mb-2">
                    Adapted for {transformed.style.charAt(0).toUpperCase() + transformed.style.slice(1)} Learning
                  </h5>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded text-sm text-foreground whitespace-pre-wrap">
                    {transformed.content}
                  </div>
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 sm:justify-end">
                {note.file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(note.file_url!, note.file_name!)}
                    className="flex items-center gap-2 h-11 px-4 text-base sm:text-sm justify-center"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(note.id, note.file_url)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive h-11 px-4 text-base sm:text-sm justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default NotesList;