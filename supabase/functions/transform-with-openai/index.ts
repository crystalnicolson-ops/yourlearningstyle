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
          systemPrompt = 'You are an expert educational content architect specializing in creating clear, well-organized learning materials.';
          userPrompt = `Transform the provided content into comprehensive enhanced notes with clear structure and organization.

📐 STRUCTURE (Mandatory Hierarchy):
Organize content into this EXACT structure with BOLD headings:
• **# MAIN TITLE** - Top-level overview
• **### Topic** - Main topics and divisions (use descriptive names)
• **#### Detail** - Specific information and details

CRITICAL: Add blank lines before and after each heading for clear separation.

🎯 ORGANIZATION PRINCIPLES:
• Group related concepts by THEME under clear topic headings
• Each section should have ONE clear focus
• Use descriptive heading names that tell what the section is about
• Add visual tags to mark categories:
  - 📖 Definition
  - 🔄 Process/Methodology
  - 💡 Key Insight
  - ⚡ Important Fact
  - 🔗 Connection/Relationship
  - ⚠️ Critical Point
  - 📊 Data/Statistics

⚙️ CAUSE-EFFECT RELATIONSHIPS (Use Selectively):
ONLY when a concept has clear causal relationships, show:

**Cause → Effect**
- **Cause:** What led to this?
- **Effect:** What was the result?

Use this sparingly - only for the most important causal relationships.

📚 SECTION ENDINGS (Required for major topics):
Each **### Topic** should end with:

**📋 Key Takeaways**
- [2-4 bullet points with the most important insights]

🎓 DIFFICULTY LEVELS:
Tag concepts with difficulty where helpful:
- 🟢 **Beginner:** Basic concepts
- 🟡 **Intermediate:** Applied knowledge
- 🔴 **Advanced:** Complex analysis

📝 CONTENT REQUIREMENTS:
• Define technical terms clearly
• Provide context when needed
• Add examples where helpful
• Keep sections focused and digestible
• Use clear, descriptive headings
• Ensure logical flow between sections

✨ FORMATTING STANDARDS:
• **Bold ALL headings** (# ### ####)
• Use **bold** for key terms and definitions
• Use *italics* for emphasis
• Use > blockquotes for critical takeaways
• Add horizontal rules (---) between major topics only
• Ensure generous spacing between sections
• Make headings descriptive (not generic)

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