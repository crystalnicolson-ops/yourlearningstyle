import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const learningStylePrompts = {
  visual: "Transform this content to be optimized for visual learners. Use bullet points, diagrams descriptions, visual metaphors, charts, and structured layouts. Make it scannable with clear headings and visual organization.",
  auditory: "Transform this content for auditory learners. Use conversational tone, repetition for emphasis, rhythm and flow, discussion questions, and explain concepts as if speaking aloud. Include mnemonic devices and verbal patterns.",
  kinesthetic: "Transform this content for kinesthetic learners. Include hands-on activities, practical examples, step-by-step instructions, real-world applications, and actionable exercises. Make it interactive and experiential.",
  reading: "Transform this content for reading/writing learners. Organize with detailed written explanations, comprehensive notes, lists, definitions, and encourage note-taking. Use rich vocabulary and thorough written descriptions."
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { content, learningStyle } = await req.json();

    if (!content || !learningStyle) {
      return new Response(
        JSON.stringify({ error: 'Content and learning style are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const stylePrompt = learningStylePrompts[learningStyle as keyof typeof learningStylePrompts];
    if (!stylePrompt) {
      return new Response(
        JSON.stringify({ error: 'Invalid learning style' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Transforming content for ${learningStyle} learning style`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content adapter. ${stylePrompt}`
          },
          {
            role: 'user',
            content: `Please transform the following content:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const transformedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        transformedContent,
        learningStyle 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in transform-learning-style function:', error);
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