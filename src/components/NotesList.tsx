import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface NotesListProps {
  refreshTrigger?: number;
}

const NotesList = ({ refreshTrigger }: NotesListProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const handleDelete = async (noteId: string, fileUrl: string | null) => {
    try {
      // Delete file from storage if exists
      if (fileUrl) {
        const filePath = fileUrl.split('/').pop();
        if (filePath) {
          await supabase.storage.from('notes').remove([filePath]);
        }
      }

      // Delete note record
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully.",
      });

      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
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
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileTypeColor = (fileType: string | null) => {
    if (!fileType) return 'default';
    if (fileType.includes('pdf')) return 'destructive';
    if (fileType.includes('image')) return 'secondary';
    if (fileType.includes('text') || fileType.includes('document')) return 'default';
    return 'outline';
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
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Notes Yet</h3>
          <p className="text-muted-foreground">Upload your first note to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Your Notes ({notes.length})</h3>
      </div>
      
      {notes.map((note) => (
        <Card key={note.id} className="p-4 bg-gradient-card shadow-card border-0 hover:shadow-soft transition-all duration-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{note.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(note.created_at)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {note.file_name && (
                  <Badge variant={getFileTypeColor(note.file_type)}>
                    {note.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(note.id, note.file_url)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {note.content && (
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            )}

            {note.file_url && note.file_name && (
              <div className="flex items-center justify-between bg-background/50 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{note.file_name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(note.file_url!, note.file_name!)}
                  className="h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;