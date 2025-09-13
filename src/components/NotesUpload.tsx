import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotesUploadProps {
  onUploadSuccess?: () => void;
}

const NotesUpload = ({ onUploadSuccess }: NotesUploadProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload notes.",
          variant: "destructive",
        });
        return;
      }

      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      // Upload file if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      // Create note record
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim() || null,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Note uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setContent('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Upload Notes</h3>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="bg-background"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Content (Optional)
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your notes here..."
            className="bg-background min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            File (Optional)
          </label>
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
              accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif"
            />
            {file && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || !title.trim()}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload Note"}
        </Button>
      </div>
    </Card>
  );
};

export default NotesUpload;