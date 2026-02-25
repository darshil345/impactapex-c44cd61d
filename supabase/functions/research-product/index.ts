import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productId, url } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to researching
    await supabase.from("products").update({ research_status: "researching" }).eq("id", productId);

    const systemPrompt = `You are an expert product analyst. Given a product URL, provide comprehensive research and analysis. You must respond using the provided tool/function.

Analyze the product thoroughly considering:
1. What the product is and who it's for
2. Quality, value, and innovation assessment
3. Sustainability and environmental impact
4. Market popularity and reputation
5. Whether users should buy it or not
6. Pros and cons
7. Comparison with alternatives

Rate each dimension from 0-100.`;

    const userPrompt = `Research this product URL thoroughly: ${url}
    
Based on the URL pattern and any knowledge you have about this product/brand, provide a complete analysis. Extract the product name and brand from the URL if possible. Give honest, helpful insights about whether this product is worth buying.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_product_research",
              description: "Submit the complete product research analysis",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Product name" },
                  brand: { type: "string", description: "Brand/company name" },
                  category: { type: "string", description: "Product category (e.g. Electronics, Fashion, Food, Software, etc.)" },
                  description: { type: "string", description: "Brief product description (1-2 sentences)" },
                  ai_summary: { type: "string", description: "Detailed analysis summary (3-5 sentences covering key findings)" },
                  pros: { type: "array", items: { type: "string" }, description: "List of 3-5 pros" },
                  cons: { type: "array", items: { type: "string" }, description: "List of 3-5 cons" },
                  overall_rating: { type: "number", description: "Overall rating 0-100" },
                  value_score: { type: "number", description: "Value for money score 0-100" },
                  quality_score: { type: "number", description: "Quality score 0-100" },
                  innovation_score: { type: "number", description: "Innovation score 0-100" },
                  sustainability_score: { type: "number", description: "Sustainability/eco-friendliness score 0-100" },
                  popularity_score: { type: "number", description: "Market popularity score 0-100" },
                  is_recommended: { type: "boolean", description: "Whether you recommend this product" },
                  verdict: { type: "string", description: "One-line verdict (e.g. 'Great value for everyday use')" },
                  alternatives: { type: "string", description: "Brief mention of 2-3 alternatives to consider" },
                },
                required: ["name", "brand", "category", "description", "ai_summary", "pros", "cons", "overall_rating", "value_score", "quality_score", "innovation_score", "sustainability_score", "popularity_score", "is_recommended", "verdict"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_product_research" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        await supabase.from("products").update({ research_status: "error", ai_summary: "Rate limited. Please try again later." }).eq("id", productId);
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await supabase.from("products").update({ research_status: "error", ai_summary: "AI credits exhausted." }).eq("id", productId);
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const research = JSON.parse(toolCall.function.arguments);

    // Update the product with research results
    const { error: updateError } = await supabase.from("products").update({
      name: research.name,
      brand: research.brand,
      category: research.category,
      description: research.description,
      ai_summary: research.ai_summary,
      pros: research.pros,
      cons: research.cons,
      overall_rating: research.overall_rating,
      value_score: research.value_score,
      quality_score: research.quality_score,
      innovation_score: research.innovation_score,
      sustainability_score: research.sustainability_score,
      popularity_score: research.popularity_score,
      is_recommended: research.is_recommended,
      research_status: "completed",
      research_data: { verdict: research.verdict, alternatives: research.alternatives || "" },
    }).eq("id", productId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, research }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("research-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
