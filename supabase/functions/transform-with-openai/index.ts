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
          systemPrompt = 'You are an expert educational content architect specializing in creating deeply structured, adaptive learning materials using the Luvable Note Logic Framework.';
          userPrompt = `Transform the provided content into comprehensive enhanced notes following the Luvable Note Logic Framework.

📐 STRUCTURE AUTO-DETECTION (Mandatory Hierarchy):
Analyze the content and organize it into this EXACT structure:
• # Title (Main Topic) - Top-level overview
• ## Subtopic - Major divisions of the topic
• ### Section - Specific areas within subtopics
• #### Detail - Granular information and specifics

Auto-detect the natural structure of the content and impose this hierarchy strictly.

🎯 CLUSTERING PRINCIPLES:
• Group related concepts by THEME (e.g., all definitions together, all processes together)
• Maintain CHRONOLOGICAL ORDER within themes when applicable
• Use visual tags to mark categories:
  - 📖 Definition
  - 🔄 Process/Methodology
  - 💡 Key Insight
  - ⚡ Important Fact
  - 🔗 Connection/Relationship
  - ⚠️ Critical Point
  - 📊 Data/Statistics

⚙️ CAUSE-EFFECT-RESULT FRAMEWORK:
For each major concept or event, explicitly show:
1. **Cause:** What led to this? What were the conditions?
2. **Effect:** What happened as a direct result?
3. **Result:** What were the longer-term outcomes?

Format as:
**Cause → Effect → Result**
- **Cause:** [explanation]
- **Effect:** [direct consequence]
- **Result:** [ultimate outcome]

📚 SECTION ENDINGS (Required for EVERY section):
Each ### Section and ## Subtopic MUST end with:

**📋 Summary**
[3-5 bullet points capturing the essence]

**❓ Self-Assessment Questions**
1. [Comprehension question with clear, complete answer]
2. [Application question with clear, complete answer]
3. [Analysis question with clear, complete answer]

NO UNANSWERED QUESTIONS - Every question must have a complete answer immediately following it.
Format: **Q:** [question]  
**A:** [complete answer]

🎓 DIFFICULTY LEVELS (Assign to each concept):
Tag every major concept/detail with difficulty:
- 🟢 **Beginner:** Basic facts and definitions
- 🟡 **Intermediate:** Connections and applications
- 🔴 **Advanced:** Complex analysis and synthesis

This enables adaptive flashcard generation later.

📝 COMPLETE CONTENT REQUIREMENTS:
• Define ALL technical terms and acronyms on first use
• Provide context for people, places, events, organizations
• Explain the "why" and "so what" for every major point
• Add real-world examples and applications
• Show relationships between concepts explicitly
• Include relevant dates, statistics, supporting details
• Make content self-contained (understandable without source)

✨ FORMATTING STANDARDS:
• Use **bold** for key terms and definitions
• Use *italics* for emphasis
• Use > blockquotes for important takeaways
• Use horizontal rules (---) between major sections
• Ensure proper spacing and readability

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