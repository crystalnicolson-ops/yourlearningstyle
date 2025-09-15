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
    const { text, voice = 'alice' } = await req.json();
    
    if (!text) {
      throw new Error("Text is required");
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    console.log('Generating speech for text length:', text.length);

    // Create TwiML for text-to-speech
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${text.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))}</Say>
</Response>`;

    // Since Twilio doesn't provide direct audio file generation,
    // we'll use a workaround with their Voice API
    const credentials = btoa(`${accountSid}:${authToken}`);
    
    // Create a call to generate the audio (this is a limitation of Twilio's API)
    const callData = new URLSearchParams({
      'Twiml': twiml,
      'To': 'client:audio-generator', // This won't actually place a call
      'From': '+15551234567' // Placeholder number
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: callData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', error);
      
      // Fallback: Generate simple audio data placeholder
      // Since Twilio doesn't directly support file generation like OpenAI,
      // we'll create a simple response indicating the limitation
      console.log('Twilio TTS limitation - returning text response');
      
      return new Response(JSON.stringify({ 
        audioBase64: null,
        voice: voice,
        text: text,
        message: "Twilio TTS configured but requires phone-based implementation. Consider using ElevenLabs or OpenAI for direct audio file generation."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    console.log('Twilio response:', result);

    // Since we can't get actual audio files from Twilio easily,
    // return the text with a message explaining the limitation
    return new Response(JSON.stringify({ 
      audioBase64: null,
      voice: voice,
      text: text,
      twilioCallSid: result.sid,
      message: "Twilio TTS is configured but designed for phone calls. For direct audio file generation, consider using ElevenLabs or OpenAI."
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