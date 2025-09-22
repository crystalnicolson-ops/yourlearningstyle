import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const content = body?.content;
    let count = Number(body?.count ?? 25);
    if (!Number.isFinite(count)) count = 25;
    // Clamp to a reasonable range to avoid overly long responses
    count = Math.max(5, Math.min(30, Math.round(count)));

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('generate-quiz: requested count =', count);
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const excludeQuestions: string[] = Array.isArray(body?.excludeQuestions) ? body.excludeQuestions : [];
    const excludeBlock = excludeQuestions.length
      ? `\nDo NOT include any questions that match or closely rephrase any of these existing questions:\n- ${excludeQuestions.join("\n- ")}`
      : "";
    const prompt = `Based on the following study material, create exactly ${count} multiple-choice questions. Each question must have 4 options (A, B, C, D) with only one correct answer. Focus on key concepts, important facts, and main ideas from the material. Keep questions and options concise.

Return the response as a JSON array with this exact format:
[
  {
    "question": "What is the main concept discussed?",
    "options": {
      "A": "Option 1",
      "B": "Option 2",
      "C": "Option 3",
      "D": "Option 4"
    },
    "correctAnswer": "B"
  }
]
${excludeBlock}

Study Material:
${content}`;

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
            content: 'You are an educational quiz generator. Create clear, accurate multiple-choice questions based on study material. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let quizQuestions: Array<{ question: string; options: Record<string,string>; correctAnswer: string }> = [];
    try {
      // Clean the response to ensure it's valid JSON
      const cleanContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      quizQuestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', generatedContent);
      throw new Error('Failed to generate valid quiz format');
    }

    // If fewer than requested, try one more pass for the remainder
    if (quizQuestions.length < count) {
      const need = count - quizQuestions.length;
      const excludeQuestionsAll = [...excludeQuestions, ...quizQuestions.map(q => q.question)];
      const extraPrompt = `Create exactly ${need} additional multiple-choice questions (A, B, C, D) with one correct answer based on the same study material. Do NOT duplicate or closely rephrase any of these existing questions:\n- ${excludeQuestionsAll.join("\n- ")}\n\nReturn ONLY valid JSON array in the same schema.`;

      const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an educational quiz generator. Always return valid JSON.' },
            { role: 'user', content: extraPrompt + "\n\nStudy Material:\n" + content }
          ],
          temperature: 0.6,
          max_tokens: 2000,
        }),
      });

      if (response2.ok) {
        const data2 = await response2.json();
        const generatedContent2 = data2.choices[0].message.content;
        try {
          const clean2 = generatedContent2.replace(/```json\n?|\n?```/g, '').trim();
          const more = JSON.parse(clean2);
          const combined = [...quizQuestions, ...more];
          // Deduplicate by question text
          const seen = new Set<string>();
          quizQuestions = combined.filter(q => {
            if (seen.has(q.question)) return false;
            seen.add(q.question);
            return true;
          }).slice(0, count);
        } catch (e) {
          console.warn('Second pass parse failed:', generatedContent2);
        }
      }
    }

    return new Response(JSON.stringify({ 
      questions: quizQuestions,
      totalQuestions: quizQuestions.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});