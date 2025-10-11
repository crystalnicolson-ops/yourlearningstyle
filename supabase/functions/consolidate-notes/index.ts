import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes } = await req.json();
    
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide an array of notes to consolidate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the content for consolidation
    const notesContent = notes.map((note: any, index: number) => 
      `=== Document ${index + 1}: ${note.title} ===\n${note.content}\n`
    ).join("\n");

    console.log(`Consolidating ${notes.length} notes`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert document consolidator. Your task is to:
1. Merge multiple documents into one cohesive, well-organized document
2. Remove redundant information and duplicates
3. Organize content in a logical flow with clear sections
4. Maintain all important information from all sources
5. Create clear headings and structure
6. Ensure the final document is comprehensive yet concise

Format the output with clear markdown headings (##) for major sections.`
          },
          {
            role: "user",
            content: `Please consolidate these ${notes.length} documents into one well-organized document:\n\n${notesContent}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const consolidatedContent = data.choices[0].message.content;

    console.log("Consolidation complete");

    return new Response(
      JSON.stringify({ 
        consolidatedContent,
        originalTitles: notes.map((n: any) => n.title)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in consolidate-notes function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
