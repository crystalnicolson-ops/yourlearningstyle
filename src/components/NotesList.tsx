import { useState, useEffect } from "react";
import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestNotes, deleteGuestNote } from "@/lib/guestNotes";

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

const NotesList = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
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
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-4 bg-gradient-card shadow-card border-0">
          <div className="flex items-start justify-between flex-wrap">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">{note.title}</h4>
              
              {note.content && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                  {note.content}
                </p>
              )}
              
              {note.file_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  <span>{note.file_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 ml-4 flex-shrink-0">
              {note.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(note.file_url!, note.file_name!)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(note.id, note.file_url)}
                className="text-destructive hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>

            {/* Mobile actions */}
            <div className="w-full flex items-center gap-2 justify-end mt-3 sm:hidden">
              {note.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(note.file_url!, note.file_name!)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(note.id, note.file_url)}
                className="text-destructive hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;