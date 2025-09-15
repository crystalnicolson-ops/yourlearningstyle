import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import mammoth from 'https://esm.sh/mammoth@1.6.0';

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

    // Prefer downloading directly by storage path when provided
    let blob: Blob | null = null;
    if (filePath && supabase) {
      const { data, error } = await supabase.storage.from('notes').download(filePath);
      if (error) {
        console.error('Direct storage download error:', error.message);
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
      // TODO: Implement PDF parsing (pdfjs-dist). For now, placeholder.
      extractedText = '[PDF text extraction will be added soon. Please copy/paste text for now.]';
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