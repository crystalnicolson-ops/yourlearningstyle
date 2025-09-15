import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI Studio API key not configured');
    }

    console.log('Processing text manipulation request with Gemini');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const transformedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!transformedText) {
      throw new Error('No content generated');
    }

    console.log('Text manipulation completed successfully');

    return new Response(JSON.stringify({ 
      transformedText
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Gemini text manipulation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});