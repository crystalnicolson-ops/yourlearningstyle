import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'Aria' } = await req.json();
    
    const safeText = String(text || '').slice(0, 2000);
    if (!safeText) {
      throw new Error("Text is required");
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Generating speech for text length:', safeText.length);

    // Map voice names to ElevenLabs voice IDs
    const voiceMap: Record<string, string> = {
      'Aria': '9BWtsMINqrJLrRacOk9x',
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Laura': 'FGY2WhTYpPnrIDTdsKH5',
      'Charlie': 'IKne3meq5aSn9XLyUdCD',
      'George': 'JBFqnCBsd6RMkjVDRZzb',
      'Callum': 'N2lVS1w4EtoT3dr4eOWO',
      'River': 'SAz9YHcvj6GT2YYXdXww',
      'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
      'Charlotte': 'XB0fDUnXU5powFXDhCwa',
      'Alice': 'Xb7hH8MSUJpSbSDYk0k2'
    };

    const voiceId = voiceMap[voice] || voiceMap['Aria'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: safeText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);

      // Fallback to OpenAI TTS if ElevenLabs fails
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiKey) {
        try {
          console.log('Falling back to OpenAI TTS');
          const oiRes = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1',
              input: safeText,
              voice: 'alloy',
              response_format: 'mp3',
            }),
          });

          if (!oiRes.ok) {
            const oiErr = await oiRes.text();
            throw new Error(`OpenAI TTS failed: ${oiErr}`);
          }

          const oiBuf = await oiRes.arrayBuffer();
          const oiBase64 = encodeBase64(new Uint8Array(oiBuf));

          return new Response(JSON.stringify({
            audioBase64: oiBase64,
            voice,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (fallbackErr) {
          console.error('Fallback TTS error:', fallbackErr);
          throw new Error(`Failed to generate speech: ${error}`);
        }
      }

      throw new Error(`Failed to generate speech: ${error}`);
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    console.log('Speech generated successfully, audio size:', arrayBuffer.byteLength);

    return new Response(JSON.stringify({ 
      audioBase64: base64Audio,
      voice: voice
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});