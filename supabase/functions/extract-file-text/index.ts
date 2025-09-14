import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileType, fileName } = await req.json();

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'File URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Extracting text from ${fileName} (${fileType})`);

    let extractedText = '';

    // Handle different file types
    if (fileType === 'text/plain' || fileName?.endsWith('.txt') || fileName?.endsWith('.md')) {
      // Plain text files
      const response = await fetch(fileUrl);
      extractedText = await response.text();
    } else if (fileType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      // For PDF files, we would need a PDF parsing library
      // For now, return a message indicating PDF parsing is not yet implemented
      extractedText = '[PDF content extraction not yet implemented. Please copy and paste the text manually.]';
    } else if (fileType?.includes('word') || fileName?.endsWith('.docx') || fileName?.endsWith('.doc')) {
      // For DOCX files, we would need a DOCX parsing library
      // For now, return a message indicating DOCX parsing is not yet implemented
      extractedText = '[DOCX content extraction not yet implemented. Please copy and paste the text manually.]';
    } else if (fileType?.includes('json')) {
      // JSON files
      const response = await fetch(fileUrl);
      const jsonData = await response.json();
      extractedText = JSON.stringify(jsonData, null, 2);
    } else {
      // Unsupported file type
      extractedText = '[This file type is not supported for text extraction. Please add text content manually.]';
    }

    return new Response(
      JSON.stringify({ 
        extractedText: extractedText.substring(0, 10000) // Limit to 10k characters
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in extract-file-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});