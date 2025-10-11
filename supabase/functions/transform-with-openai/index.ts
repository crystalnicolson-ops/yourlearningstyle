import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, learningStyle, customPrompt } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (customPrompt) {
      systemPrompt = 'You are an expert educational content transformer.';
      userPrompt = `${customPrompt}\n\nContent to transform:\n${content}`;
    } else {
      // Define prompts based on learning style
      switch (learningStyle) {
        case 'visual':
          systemPrompt = 'You are an expert at creating educational flashcards. Create clear, concise flashcards that help students learn and remember key concepts.';
          userPrompt = `Create flashcards from the following content. Each flashcard should have a clear question and a comprehensive answer. Format your response as a JSON array with objects containing "question" and "answer" fields.

Content: ${content}

Return only the JSON array of flashcards, no other text.`;
          break;

        case 'auditory':
          systemPrompt = 'You are an expert at transforming text for audio learning. Create content that flows naturally when spoken aloud.';
          userPrompt = `Transform the following content into a format optimized for audio learning. Make it conversational, add smooth transitions between topics, and structure it so it's easy to follow when listened to. Keep it engaging but concise (under 4000 characters).

Content: ${content}`;
          break;

        case 'enhanced':
          systemPrompt = 'You are an expert note-taking assistant and educational content enhancer with a talent for creating comprehensive, narrative-driven learning materials.';
          userPrompt = `Transform the provided content into comprehensive, well-structured notes that tell a complete story and are both deeply informative and easy to study from.

ENHANCEMENT OBJECTIVES:
• Expand on ALL key concepts with thorough explanations and full context
• Add comprehensive background information and historical context
• Define every important term, acronym, and technical concept
• Create logical, flowing narrative that connects ideas naturally
• For chronological content: tell the story of how events unfolded and why
• Make content rich, complete, and deeply explanatory without being verbose

STORYTELLING & NARRATIVE (especially for chronological content):
• Establish context at the beginning - set the stage
• Explain the "why" behind events and decisions
• Show cause-and-effect relationships clearly
• Create smooth transitions between topics and time periods
• Build a narrative arc that helps readers follow the progression
• Connect past events to present outcomes and future implications
• Use descriptive language to paint a complete picture

FORMATTING REQUIREMENTS:
• Use clear hierarchical headings (# ## ###) to organize the narrative
• Organize information with bullet points and numbered lists
• Add bold text for **key terms and definitions**
• Use *italics* for emphasis and important concepts
• Include context boxes or background sections
• Add summary sections and key takeaway points
• Use proper spacing and line breaks for readability

CONTENT DEPTH & COMPLETENESS:
• Define EVERY technical term, concept, or unfamiliar word
• Provide background context for people, places, organizations, and events
• Explain acronyms on first use (e.g., "WHO (World Health Organization)")
• Add relevant examples, analogies, or real-world applications
• Show relationships between different concepts and ideas
• Include the significance and implications of information
• Answer anticipated questions about "why this matters"
• Ensure no concept is left incomplete or unexplained
• Add relevant statistics, dates, or supporting details when they enhance understanding

EDUCATIONAL ENHANCEMENT:
• Make complex ideas accessible through clear explanation
• Build from simple to complex concepts progressively
• Connect new information to likely prior knowledge
• Highlight practical insights and real-world relevance
• Ensure accuracy while maximizing comprehension
• Create notes that could be understood independently without the source material

Content to enhance: ${content}`;
          break;

        default:
          systemPrompt = 'You are a helpful educational assistant.';
          userPrompt = `Transform this content for better learning: ${content}`;
      }
    }

    console.log(`Processing ${learningStyle || 'custom'} transformation request with OpenAI`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const transformedContent = data.choices[0].message.content;

    let result;
    if (learningStyle === 'visual') {
      try {
        // Try to parse as JSON for flashcards
        const flashcards = JSON.parse(transformedContent);
        if (Array.isArray(flashcards)) {
          result = {
            type: 'flashcards',
            transformedContent: flashcards
          };
        } else {
          throw new Error('Invalid flashcard format');
        }
      } catch (parseError) {
        console.error('JSON parsing error for flashcards:', parseError);
        // If JSON parsing fails, return as text
        result = {
          type: 'text',
          transformedContent: transformedContent
        };
      }
    } else {
      result = {
        type: learningStyle || 'text',
        transformedContent: transformedContent
      };
    }

    console.log(`OpenAI transformation completed successfully for ${learningStyle || 'custom'}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in transform-with-openai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});