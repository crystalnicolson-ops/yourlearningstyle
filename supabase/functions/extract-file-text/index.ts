import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import mammoth from 'https://esm.sh/mammoth@1.6.0';
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@3.11.174/legacy/build/pdf.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function downloadFromStorage(fileUrl: string): Promise<Blob | null> {
  try {
    if (!supabase) return null;
    // Try to derive bucket and path from the public URL
    // Supported patterns:
    // .../storage/v1/object/public/notes/<path>
    // .../storage/v1/object/notes/<path>
    const match = fileUrl.match(/\/storage\/v1\/object\/(?:public\/)?notes\/(.+)$/);
    if (!match) return null;
    const path = match[1];
    const { data, error } = await supabase.storage.from('notes').download(path);
    if (error) {
      console.error('Storage download error:', error.message);
      return null;
    }
    return data as Blob;
  } catch (e) {
    console.error('downloadFromStorage failed:', e);
    return null;
  }
}

function sniffType(fileType?: string | null, fileName?: string | null): string {
  if (fileType) return fileType;
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'text/plain';
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (name.endsWith('.doc')) return 'application/msword';
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileType, fileName, filePath } = await req.json();

    if (!fileUrl && !filePath) {
      return new Response(
        JSON.stringify({ error: 'File URL or file path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectiveType = sniffType(fileType, fileName);
    console.log(`Extracting text: name=${fileName} type=${effectiveType} path=${filePath || 'n/a'}`);

    // Handle data URLs specially
    let blob: Blob | null = null;
    if (fileUrl && fileUrl.startsWith('data:')) {
      console.log('Processing data URL');
      try {
        const response = await fetch(fileUrl);
        if (response.ok) {
          blob = await response.blob();
          console.log(`Successfully processed data URL, blob size: ${blob.size} bytes`);
        } else {
          throw new Error(`Failed to process data URL: ${response.status}`);
        }
      } catch (dataError) {
        console.error('Data URL processing error:', dataError);
        throw new Error(`Failed to process uploaded file: ${dataError.message}`);
      }
    }
    // Handle regular file URLs
    else if (filePath && supabase) {
      console.log('Attempting direct storage download for:', filePath);
      const { data, error } = await supabase.storage.from('notes').download(filePath);
      if (error) {
        console.error('Direct storage download error:', error.message);
        // Try with signed URL as fallback
        const { data: signedData, error: signedError } = await supabase.storage
          .from('notes')
          .createSignedUrl(filePath, 60); // 60 seconds expiry
        
        if (!signedError && signedData?.signedUrl) {
          console.log('Using signed URL for download');
          const resp = await fetch(signedData.signedUrl);
          if (resp.ok) {
            blob = await resp.blob();
          }
        }
      } else {
        blob = data as Blob;
      }
    }

    // Fallback: try deriving from URL (works even if bucket is private)
    if (!blob && fileUrl) {
      blob = await downloadFromStorage(fileUrl);
    }

    // Final fallback: direct fetch (works for public URLs and data URLs)
    if (!blob && fileUrl) {
      const resp = await fetch(fileUrl);
      if (!resp.ok) {
        throw new Error(`Failed to fetch file: ${resp.status}`);
      }
      blob = await resp.blob();
    }

    if (!blob) {
      throw new Error(`Unable to retrieve file data. Please try uploading the file again.`);
    }

    let extractedText = '';

    if (effectiveType === 'text/plain') {
      extractedText = await (blob as Blob).text();
    } else if (effectiveType.includes('word') || (fileName || '').toLowerCase().endsWith('.docx')) {
      // DOCX via mammoth
      const arrayBuffer = await (blob as Blob).arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = (result?.value || '').trim();
      if (!extractedText) {
        // Try converting to HTML and stripping tags as fallback
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        const html = htmlResult?.value || '';
        extractedText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } else if (effectiveType.includes('msword') || (fileName || '').toLowerCase().endsWith('.doc')) {
      extractedText = '[Legacy .doc files are not supported. Please resave your document as .docx and re-upload.]';
    } else if (effectiveType.includes('pdf') || (fileName || '').toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await (blob as Blob).arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjsLib.getDocument({
          data: uint8,
          isEvalSupported: false,
          disableWorker: true,
          useWorkerFetch: false,
          disableFontFace: true,
          disableRange: true,
          disableAutoFetch: true,
          disableStream: true
        });
        const pdf = await loadingTask.promise;
        const parts: string[] = [];
        const limit = Math.min(pdf.numPages, 100);
        for (let i = 1; i <= limit; i++) {
          const page = await pdf.getPage(i);
          const content: any = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
          const items = (content.items as any[]) || [];
          let pageText = '';
          for (const it of items) {
            if (typeof it?.str === 'string') {
              pageText += it.str;
              if ((it as any).hasEOL) pageText += '\n';
              else pageText += ' ';
            }
          }
          parts.push(pageText);
        }
        extractedText = parts.join('\n\n').replace(/\s+/g, ' ').trim();
        if (!extractedText) {
          // Fallback pass with different settings to handle tricky embedded fonts
          try {
            const loadingTask2 = pdfjsLib.getDocument({
              data: uint8,
              isEvalSupported: false,
              disableWorker: true,
              disableFontFace: false,
              disableRange: true,
              disableAutoFetch: true,
              disableStream: true,
            });
            const pdf2 = await loadingTask2.promise;
            const parts2: string[] = [];
            const limit2 = Math.min(pdf2.numPages, 100);
            for (let i = 1; i <= limit2; i++) {
              const page2 = await pdf2.getPage(i);
              const content2: any = await page2.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: true, includeMarkedContent: true as any });
              const items2 = (content2.items as any[]) || [];
              let pageText2 = '';
              for (const it of items2) {
                if (typeof it?.str === 'string') {
                  pageText2 += it.str + ' ';
                }
              }
              parts2.push(pageText2);
            }
            extractedText = parts2.join('\n\n').replace(/\s+/g, ' ').trim();
          } catch (fallbackErr) {
            console.warn('PDF fallback parsing failed:', fallbackErr);
          }
        }

        if (!extractedText) {
          extractedText = '[Unable to extract text from this PDF. It may be image-based or encrypted.]';
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        extractedText = '';
      }

      // Final naive fallback: parse PDF content streams for (text) Tj/TJ operators
      if (!extractedText) {
        try {
          const arrayBuffer = await (blob as Blob).arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const raw = new TextDecoder('latin1').decode(bytes);

          const pieces: string[] = [];
          const unescape = (s: string) => s
            .replace(/\\\)/g, ')')
            .replace(/\\\(/g, '(')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');

          const tjRegex = /\(([^)]*)\)\s*Tj/gm;
          let m: RegExpExecArray | null;
          while ((m = tjRegex.exec(raw)) !== null) {
            pieces.push(unescape(m[1]));
          }

          const tjArrayRegex = /TJ\s*\[([^\]]+)\]/gm;
          while ((m = tjArrayRegex.exec(raw)) !== null) {
            const arr = m[1];
            const strPieces = [...arr.matchAll(/\(([^)]*)\)/g)].map(x => unescape(x[1]));
            if (strPieces.length) pieces.push(strPieces.join(''));
          }

          const naive = pieces.join(' ').replace(/\s+/g, ' ').trim();
          if (naive) extractedText = naive;
        } catch (naiveErr) {
          console.warn('Naive PDF parsing failed:', naiveErr);
        }
      }

      if (!extractedText) {
        extractedText = '[Unable to extract text from this PDF. It may be image-based or encrypted.]';
      }
    } else if (effectiveType.includes('json')) {
      const txt = await (blob as Blob).text();
      try {
        const json = JSON.parse(txt);
        extractedText = JSON.stringify(json, null, 2);
      } catch {
        extractedText = txt;
      }
    } else {
      extractedText = '[This file type is not supported for automatic text extraction yet.]';
    }

    return new Response(
      JSON.stringify({ extractedText: extractedText?.slice(0, 20000) || '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in extract-file-text function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});