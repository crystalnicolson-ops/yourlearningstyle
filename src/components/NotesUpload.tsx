import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NotesUpload = ({ onNoteAdded }: { onNoteAdded: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('notes')
      .upload(fileName, file);
    
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload notes",
          variant: "destructive",
        });
        return;
      }

      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (file) {
        const filePath = await uploadFile(file, user.id);
        const { data } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);
        
        fileUrl = data.publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            content: content.trim() || null,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Note uploaded successfully",
        description: "Your note has been saved",
      });

      // Reset form
      setTitle("");
      setContent("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onNoteAdded();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload note",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Upload Note
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Textarea
            placeholder="Note content (optional)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px]"
          />
        </div>
        
        <div>
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
              className="w-full"
            />
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({Math.round(file.size / 1024)}KB)</span>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isUploading || !title.trim()}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Note"}
        </Button>
      </form>
    </Card>
  );
};

export default NotesUpload;