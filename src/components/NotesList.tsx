import { useState, useEffect } from "react";
import { FileText, Trash2, Calendar, ChevronDown, ChevronUp, Merge } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestNotes, deleteGuestNote, updateGuestNote } from "@/lib/guestNotes";
import LearningStyleTransform from "./LearningStyleTransform";
import GeminiTextManipulator from "./GeminiTextManipulator";
import SimpleTransform from "./SimpleTransform";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;
import Tesseract from 'tesseract.js';

// Local PDF extractor for data URLs (guest mode)
const extractPdfTextFromDataUrl = async (dataUrl: string): Promise<string> => {
  const resp = await fetch(dataUrl);
  if (!resp.ok) throw new Error('Failed to fetch data URL');
  const blob = await resp.blob();
  const arrayBuffer = await blob.arrayBuffer();
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
};

// OCR helpers
const ocrPdfFromArrayBuffer = async (arrayBuffer: ArrayBuffer, maxPages = 3): Promise<string> => {
  const uint8 = new Uint8Array(arrayBuffer);
  const loadingTask = (pdfjsLib as any).getDocument({ data: uint8, disableWorker: true, useWorkerFetch: false, isEvalSupported: false });
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
};

const ocrPdfFromDataUrl = async (dataUrl: string, maxPages = 3): Promise<string> => {
  const resp = await fetch(dataUrl);
  if (!resp.ok) throw new Error('Failed to fetch data URL');
  const blob = await resp.blob();
  const buf = await blob.arrayBuffer();
  return ocrPdfFromArrayBuffer(buf, maxPages);
};

const ocrPdfFromUrl = async (url: string, maxPages = 3): Promise<string> => {
  const resp = await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error(`Failed to fetch PDF (${resp.status})`);
  const buf = await resp.arrayBuffer();
  return ocrPdfFromArrayBuffer(buf, maxPages);
};


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
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);
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
    name.endsWith('.pdf') ||
    name.endsWith('.json') ||
    type.includes('officedocument.wordprocessingml.document') ||
    type.includes('pdf') ||
    type.includes('json')
  );
};

const isExtractionErrorContent = (txt?: string | null) => {
  if (!txt) return false;
  const t = txt.trim().toLowerCase();
  return t.startsWith('[error extracting text from pdf') || t.startsWith('[unable to extract text');
};

const handleMergeSelected = async () => {
  const selectedNotesArray = notes.filter(n => selectedNotes.has(n.id) && n.content && n.content.trim().length > 0 && !isExtractionErrorContent(n.content));
  
  if (selectedNotesArray.length < 2) {
    toast({
      title: "Select at least 2 notes",
      description: "You need to select at least 2 notes with content to merge",
      variant: "destructive",
    });
    return;
  }

  setMerging(true);
  try {
    toast({ title: "Merging notes...", description: "AI is consolidating your documents" });
    
    const { data, error } = await supabase.functions.invoke('consolidate-notes', {
      body: {
        notes: selectedNotesArray.map(n => ({
          title: n.title,
          content: n.content,
        })),
      },
    });

    if (error) throw error;

    const mergedTitle = `Merged: ${selectedNotesArray.map(n => n.title).join(', ')}`;
    const mergedContent = data.consolidatedContent;

    if (isGuest) {
      const newNote = {
        id: crypto.randomUUID(),
        title: mergedTitle,
        content: mergedContent,
        file_url: null,
        file_name: null,
        file_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const guestNotes = getGuestNotes();
      guestNotes.push({
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        file_data_url: null,
        file_name: null,
        file_type: null,
        created_at: newNote.created_at,
        updated_at: newNote.updated_at,
      });
      localStorage.setItem('guestNotes', JSON.stringify(guestNotes));
      await fetchNotes();
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          title: mergedTitle,
          content: mergedContent,
          user_id: user.id,
        });

      if (insertError) throw insertError;
      await fetchNotes();
    }

    setSelectedNotes(new Set());
    toast({
      title: "Notes merged successfully",
      description: "Your documents have been consolidated into one note",
    });
  } catch (error: any) {
    console.error('Merge error:', error);
    toast({
      title: "Merge failed",
      description: error.message || "Failed to merge notes",
      variant: "destructive",
    });
  } finally {
    setMerging(false);
  }
};

const extractTextForNote = async (note: Note) => {
    try {
      toast({ title: 'Extracting text...', description: note.file_name || undefined });

      // Guest mode with data URL PDF: extract locally in-browser first
      const isPdf = (note.file_type || '').toLowerCase().includes('pdf') || (note.file_name || '').toLowerCase().endsWith('.pdf');
      if (isGuest && isPdf && (note.file_url || '').startsWith('data:')) {
        try {
          const localText = await extractPdfTextFromDataUrl(note.file_url as string);
          if (localText && localText.length > 0) {
            updateGuestNote(note.id, { content: localText });
            setNotes(prev => prev.map(n => (n.id === note.id ? { ...n, content: localText } : n)));
            toast({ title: 'Text extracted', description: 'You can now transform this note.' });
            return;
          }
        } catch (e) {
          console.warn('Local PDF extraction failed, falling back to server:', e);
        }
      }

      // Server extraction fallback
      const { data, error } = await supabase.functions.invoke('extract-file-text', {
        body: {
          fileUrl: note.file_url,
          fileType: note.file_type,
          fileName: note.file_name,
        },
      });
      if (error) throw error;
      let extracted = (data?.extractedText || '').trim();

      // If server returned an unusable placeholder, try OCR
      if (!extracted || isExtractionErrorContent(extracted) || extracted.length < 10) {
        const isDataUrl = (note.file_url || '').startsWith('data:');
        try {
          toast({ title: 'Running OCR (local)…', description: 'This may take ~10-20s for a few pages.' });
          extracted = isDataUrl
            ? await ocrPdfFromDataUrl(note.file_url as string, 3)
            : await ocrPdfFromUrl(note.file_url as string, 3);
        } catch (e) {
          console.warn('OCR fallback failed:', e);
        }
      }

      extracted = (extracted || '').trim();
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
    return null;
  }

  // Get the combined content from all notes that have usable content
  const allContent = notes
    .filter(note => note.content && note.content.trim().length > 0 && !isExtractionErrorContent(note.content))
    .map(note => (note.content as string))
    .join('\n\n');
  const hasAnyContent = allContent.trim().length > 0;
  
  const notesWithContent = notes.filter(note => note.content && note.content.trim().length > 0 && !isExtractionErrorContent(note.content));
  const canMerge = selectedNotes.size >= 2;

  // Handle transformation with optional consolidation
  const handleTransformWithConsolidation = async (transformationType: string) => {
    const selectedNotesArray = notes.filter(n => selectedNotes.has(n.id) && n.content && n.content.trim().length > 0 && !isExtractionErrorContent(n.content));
    
    // If multiple notes are selected, consolidate first
    if (selectedNotesArray.length >= 2) {
      setMerging(true);
      try {
        toast({ title: "Consolidating notes...", description: `Preparing to apply ${transformationType}` });
        
        const { data, error } = await supabase.functions.invoke('consolidate-notes', {
          body: {
            notes: selectedNotesArray.map(n => ({
              title: n.title,
              content: n.content,
            })),
          },
        });

        if (error) throw error;

        const mergedTitle = `Merged: ${selectedNotesArray.map(n => n.title).join(', ')}`;
        const mergedContent = data.consolidatedContent;

        // Create a temporary note with the merged content for transformation
        const tempNote: Note = {
          id: 'temp-merged',
          title: mergedTitle,
          content: mergedContent,
          file_url: null,
          file_name: null,
          file_type: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add temp note to state so transformation can use it
        setNotes(prev => [tempNote, ...prev]);
        setSelectedNotes(new Set());
        
        toast({
          title: "Notes consolidated",
          description: `Now applying ${transformationType} transformation...`,
        });
        
      } catch (error: any) {
        console.error('Consolidation error:', error);
        toast({
          title: "Consolidation failed",
          description: error.message || "Failed to consolidate notes",
          variant: "destructive",
        });
      } finally {
        setMerging(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Transform Options at Top */}
      {hasAnyContent && (
        <Card className="p-4 sm:p-4 bg-gradient-card shadow-card border-0">
          <SimpleTransform
            content={selectedNotes.size > 0 
              ? notes
                  .filter(n => selectedNotes.has(n.id) && n.content && n.content.trim().length > 0 && !isExtractionErrorContent(n.content))
                  .map(n => n.content as string)
                  .join('\n\n')
              : allContent
            }
            onTransformed={async (content, type) => {
              // If multiple notes selected, consolidate them first
              if (selectedNotes.size >= 2) {
                await handleTransformWithConsolidation(type);
                // The transformation will be applied to the consolidated note automatically
                return;
              }
              
              // Single note or no selection - use existing behavior
              const targetNote = selectedNotes.size === 1
                ? notes.find(n => selectedNotes.has(n.id))
                : notes.find(note => note.content && note.content.trim().length > 0 && !isExtractionErrorContent(note.content));
              
              if (targetNote) {
                handleTransformed(targetNote.id, content, type);
              }
            }}
          />
        </Card>
      )}

      {/* Instructions for multi-select */}
      {notesWithContent.length >= 2 && (
        <div className="text-sm text-foreground/80 text-center py-2">
          {selectedNotes.size === 0 
            ? "Select notes below to consolidate and transform them together, or transform all notes at once"
            : `${selectedNotes.size} note${selectedNotes.size !== 1 ? 's' : ''} selected — click any transform to consolidate and enhance`
          }
        </div>
      )}

      {/* File Cards Below */}
      <div className="space-y-4">
        {notes.map((note) => {
          const hasContent = !!(note.content && note.content.trim().length > 0 && !isExtractionErrorContent(note.content));
          const isExpanded = expandedNotes.has(note.id);
          const preview = hasContent ? (note.content as string) : '';
          return (
            <Card key={note.id} className="p-4 sm:p-4 bg-gradient-card shadow-card border-0">
              <div className="flex items-start gap-3">
                {/* Checkbox for selection */}
                {hasContent && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedNotes.has(note.id)}
                      onCheckedChange={(checked) => {
                        setSelectedNotes(prev => {
                          const next = new Set(prev);
                          if (checked) {
                            next.add(note.id);
                          } else {
                            next.delete(note.id);
                          }
                          return next;
                        });
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1">
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

                  {hasContent ? (
                    <div className="mb-3 space-y-2">
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {isExpanded ? preview : (preview.length > 220 ? preview.slice(0, 220) + '…' : preview)}
                      </div>
                      {preview.length > 220 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(note.id)}
                          className="h-8 px-2 text-xs text-primary"
                        >
                          {isExpanded ? 'Hide' : 'View more'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    note.file_url && (
                      <div className="flex items-center justify-between gap-3 text-xs mb-3">
                        <span className="text-muted-foreground">
                          {isExtractionErrorContent(note.content)
                            ? 'PDF appears scanned — unable to extract text. Try DOCX or paste the text.'
                            : note.file_name?.toLowerCase().endsWith('.pdf')
                            ? (extractingNotes.has(note.id) ? 'PDF detected — extracting text…' : 'PDF detected — processing automatically')
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
                    )
                  )}

                  {/* Retry extraction button when no content */}
                  {!hasContent && note.file_url && (
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setExtractingNotes(prev => new Set(prev).add(note.id));
                          extractTextForNote(note).finally(() => {
                            setExtractingNotes(prev => { const s = new Set(prev); s.delete(note.id); return s; });
                          });
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        Retry extraction
                      </Button>
                    </div>
                  )}

                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 sm:justify-end" style={{ marginLeft: hasContent ? '36px' : '0' }}>
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