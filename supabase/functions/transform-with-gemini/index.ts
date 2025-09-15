import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const learningStylePrompts = {
  visual: `Transform this content into flashcard format. Create clear question-answer pairs that would work well as flashcards for visual learners. Focus on:
- Key concepts as questions
- Concise, memorable answers
- Important facts and definitions
- Visual relationships between ideas

Format your response as a JSON array of objects with "question" and "answer" fields. Aim for 5-15 flashcards depending on content length.`,

  auditory: `Transform this content for auditory learners. Create a natural, conversational version that:
- Uses clear, spoken language patterns
- Includes transitions and connecting phrases
- Emphasizes rhythm and flow
- Breaks complex ideas into digestible spoken segments
- Uses repetition and emphasis for key points

Make it sound natural when read aloud, as if explaining to someone in person.`,

  kinesthetic: `Transform this content for kinesthetic learners by:
- Including practical examples and real-world applications
- Adding hands-on activities or exercises
- Breaking content into actionable steps
- Emphasizing learning through doing
- Including interactive elements and practice opportunities`,

  reading: `Transform this content for reading/writing learners by:
- Creating detailed explanations with comprehensive coverage
- Organizing information in clear hierarchies with headers and subheaders
- Including definitions, examples, and elaborations
- Using structured lists and bullet points
- Providing written exercises and note-taking opportunities`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, learningStyle } = await req.json();
    
    if (!content || !learningStyle) {
      throw new Error("Content and learning style are required");
    }

    if (!learningStylePrompts[learningStyle as keyof typeof learningStylePrompts]) {
      throw new Error("Invalid learning style");
    }

    const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI Studio API key not configured');
    }

    const prompt = learningStylePrompts[learningStyle as keyof typeof learningStylePrompts];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nContent to transform:\n${content}`
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
      throw new Error(error.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const transformedContent = data.candidates[0]?.content?.parts[0]?.text;

    if (!transformedContent) {
      throw new Error('No content generated');
    }

    // For visual learning (flashcards), try to parse as JSON
    if (learningStyle === 'visual') {
      try {
        // Extract JSON from the response if it's wrapped in markdown
        const jsonMatch = transformedContent.match(/```json\n([\s\S]*?)\n```/) || 
                         transformedContent.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const flashcards = JSON.parse(jsonStr);
          return new Response(JSON.stringify({ 
            transformedContent: flashcards,
            learningStyle,
            type: 'flashcards'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.log('Failed to parse as JSON, returning as text');
      }
    }

    return new Response(JSON.stringify({ 
      transformedContent,
      learningStyle,
      type: learningStyle === 'visual' ? 'flashcards' : 'text'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Transform error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});