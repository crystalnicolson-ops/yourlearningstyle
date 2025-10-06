import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addGuestNote } from "@/lib/guestNotes";
import ThinkingOverlay from "./ThinkingOverlay";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;
import Tesseract from 'tesseract.js';

async function extractPdfInBrowser(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const loadingTask = (pdfjsLib as any).getDocument({
    data: uint8,
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const parts: string[] = [];
  const limit = Math.min((pdf as any).numPages, 100);
  for (let i = 1; i <= limit; i++) {
    const page = await (pdf as any).getPage(i);
    const content: any = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
    const items = (content.items as any[]) || [];
    let pageText = '';
    for (const it of items) {
      if (typeof (it as any)?.str === 'string') {
        pageText += (it as any).str;
        pageText += (it as any).hasEOL ? '\n' : ' ';
      }
    }
    parts.push(pageText);
  }
  return parts.join('\n\n').replace(/\s+/g, ' ').trim();
}

async function ocrPdfInBrowser(file: File, maxPages = 3): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const loadingTask = (pdfjsLib as any).getDocument({
    data: uint8,
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const limit = Math.min((pdf as any).numPages, maxPages);
  let out = '';
  for (let i = 1; i <= limit; i++) {
    const page = await (pdf as any).getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    out += (text || '') + '\n\n';
  }
  return out.replace(/\s+/g, ' ').trim();
}

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

        // Try local extraction for PDFs in guest mode
        let guestContent: string | null = null;
        if ((fileType || '').toLowerCase().includes('pdf') || (fileName || '').toLowerCase().endsWith('.pdf')) {
          try {
            guestContent = await extractPdfInBrowser(file as File);
            if (!guestContent || guestContent.length < 10) {
              toast({ title: 'Running OCR (local)…', description: 'This may take ~10-20s for a few pages.' });
              guestContent = await ocrPdfInBrowser(file as File, 3);
            }
          } catch (e) {
            console.warn('Guest local extraction failed, trying OCR:', e);
            try {
              toast({ title: 'Running OCR (local)…', description: 'This may take ~10-20s for a few pages.' });
              guestContent = await ocrPdfInBrowser(file as File, 3);
            } catch (e2) {
              console.warn('Guest OCR failed:', e2);
            }
          }
        }

        addGuestNote({
          id: crypto.randomUUID(),
          title: title.trim() || file?.name || "Untitled Note",
          content: guestContent,
          file_data_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        toast({
          title: "Saved locally (guest mode)",
          description: guestContent && guestContent.length > 0 ? `Text extracted (local): ${Math.min(guestContent.length, 200)} chars preview saved.` : "Your note is stored in this browser.",
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

          // Try local PDF extraction first (more reliable in browser)
          if ((file.type || '').toLowerCase().includes('pdf') || (file.name || '').toLowerCase().endsWith('.pdf')) {
            try {
              toast({ title: 'Extracting text (local)', description: file.name });
              const localText = await extractPdfInBrowser(file);
              if (localText && localText.length > 0) {
                extractedContent = localText;
                toast({ title: 'Text extracted (local)', description: `Extracted ${localText.length} characters` });
              }
            } catch (e) {
              console.warn('Local PDF extraction failed, falling back to server:', e);
            }
          }

          // If local extraction didn't produce content, call server function
          if (!extractedContent) {
            const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-file-text', {
              body: {
                fileUrl: fileUrl,
                fileType: file.type,
                fileName: file.name,
                filePath: filePath
              }
            });

            if (extractError) {
              console.error('Extract function error:', extractError);
              throw extractError;
            }

            if (extractData?.extractedText) {
              const autoExtracted = String(extractData.extractedText).trim();
              const lower = autoExtracted.toLowerCase();
              const unusable = lower.startsWith('[error extracting text from pdf') || lower.startsWith('[unable to extract text');
              if (!unusable && autoExtracted.length > 0) {
                extractedContent = autoExtracted;
                toast({ title: 'Text extracted successfully', description: `Extracted ${autoExtracted.length} characters from ${file.name}` });
              }
            }
          }

          // If still no text, try local OCR fallback
          if (!extractedContent && (file.type || '').toLowerCase().includes('pdf')) {
            try {
              toast({ title: 'Running OCR (local)…', description: 'This may take ~10-20s for a few pages.' });
              const ocrText = await ocrPdfInBrowser(file, 3);
              if (ocrText && ocrText.length > 0) {
                extractedContent = ocrText;
                toast({ title: 'Text extracted (OCR)', description: `Extracted ${ocrText.length} characters` });
              }
            } catch (e) {
              console.warn('Local OCR failed:', e);
            }
          }

          if (!extractedContent) {
            toast({
              title: 'No text content found',
              description: `${file.name} was processed but no text content was found.`,
              variant: 'default',
            });
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
              description: `Uploaded ${file.name} but couldn't extract text content: ${errorMsg}`,
              variant: "destructive",
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
    <>
      <ThinkingOverlay 
        isVisible={isUploading} 
        message="Uploading and processing your file..."
        type="processing"
      />
      
      <Card className="p-3 sm:p-6 bg-gradient-card shadow-card border-0">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
        Upload Your Notes
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
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
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer text-sm sm:text-base font-medium border w-full sm:w-auto h-10 sm:h-11"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Choose File
            </label>
          </div>
          
          {file && (
            <Button 
              type="submit" 
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 text-sm sm:text-base h-10 sm:h-11 flex-1 sm:flex-none"
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
              className="text-muted-foreground hover:text-foreground h-10 w-10 p-0 sm:ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {file && (
          <div className="flex items-center gap-2 text-xs text-foreground bg-primary/10 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium truncate">{file.name}</span>
            <span className="text-muted-foreground">({Math.round(file.size / 1024)}KB)</span>
          </div>
        )}
        
        <p className="text-[11px] text-muted-foreground">
          PDF, DOCX, PPTX files supported • Upload your documents to extract and transform content
        </p>
      </form>
    </Card>
    </>
  );
};

export default NotesUpload;