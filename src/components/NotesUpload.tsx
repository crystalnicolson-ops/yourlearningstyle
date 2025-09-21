import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addGuestNote } from "@/lib/guestNotes";

const NotesUpload = ({ onNoteAdded }: { onNoteAdded: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  
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
    
    if (!file) {
      toast({
        title: "File required",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const readFileAsDataURL = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (!user) {
        // Guest mode: store locally
        if (file) {
          // Limit guest file size to ~1MB to avoid storage issues
          if (file.size > 1024 * 1024) {
            toast({
              title: "Guest upload limit",
              description: "In guest mode, files up to 1MB are supported.",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }
          const dataUrl = await readFileAsDataURL(file);
          fileUrl = dataUrl;
          fileName = file.name;
          fileType = file.type;
        }

        addGuestNote({
          id: crypto.randomUUID(),
          title: title.trim() || file?.name || "Untitled Note",
          content: null,
          file_data_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        toast({
          title: "Saved locally (guest mode)",
          description: "Your note is stored in this browser.",
        });

        // Reset form
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        onNoteAdded();
        return;
      }

      // Authenticated flow (Supabase)
      let extractedContent = "";
      
      if (file) {
        const filePath = await uploadFile(file, user.id);
        const { data } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);
        
        fileUrl = data.publicUrl;
        fileName = file.name;
        fileType = file.type;

        // Always try to extract text from files
        try {
          toast({
            title: "Extracting text...",
            description: `Processing ${file.name}`,
          });
          
          const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-file-text', {
              body: {
                fileUrl: fileUrl,
                fileType: file.type,
                fileName: file.name,
                filePath: filePath
              }
            });

          if (extractError) throw extractError;
          if (extractData?.extractedText) {
            const autoExtracted = extractData.extractedText;
            // Combine manual content with extracted content if both exist
             extractedContent = autoExtracted;
          }
        } catch (error) {
          console.error('Text extraction failed:', error);
          const errorMsg = error.message || 'Unable to extract text';
          
          // Show helpful message based on error type
          if (errorMsg.includes('not supported')) {
            toast({
              title: "File type not fully supported",
              description: `${file.name} was uploaded but text extraction isn't available for this format yet.`,
              variant: "default",
            });
          } else {
            toast({
              title: "Text extraction failed", 
              description: `Uploaded ${file.name} but couldn't extract text content.`,
              variant: "default",
            });
          }
          // Continue without extracted text - user will see the file but no content
        }
      }

      const { error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: title.trim() || fileName || "Untitled Note",
            content: extractedContent || null,
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
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-card border-0">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Upload Your Notes
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 text-base"
          />
        </div>
        
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 sm:flex-none">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.pptx"
              className="sr-only"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer text-base font-medium border w-full sm:w-auto h-11"
            >
              <Upload className="w-5 h-5" />
              Choose File
            </label>
          </div>
          
          {file && (
            <Button 
              type="submit" 
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 text-base h-11 flex-1 sm:flex-none"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          )}
          
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
              className="text-muted-foreground hover:text-foreground h-11 w-11 p-0 sm:ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {file && (
          <div className="flex items-center gap-2 text-sm text-foreground bg-primary/10 p-3 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium">{file.name}</span>
            <span className="text-muted-foreground">({Math.round(file.size / 1024)}KB)</span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, PPTX files supported • Upload your documents to extract and transform content
        </p>
      </form>
    </Card>
  );
};

export default NotesUpload;