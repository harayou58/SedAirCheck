import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert anesthesiologist evaluating Mallampati classification from this oral cavity photograph. This is critical for airway management assessment.

CRITICAL INSTRUCTIONS:
1. Look carefully at the ENTIRE visible oral cavity anatomy
2. Focus on what structures are CLEARLY and COMPLETELY visible
3. Be conservative in your assessment - when in doubt, choose the higher class

DETAILED Mallampati Classification Criteria:

CLASS I (Best airway):
- COMPLETE visualization of: soft palate + FULL uvula + fauces + tonsillar pillars
- All 4 structures must be clearly visible
- Tonsillar pillars (anterior and posterior) should be distinctly visible on both sides

CLASS II (Good airway):
- Visible: soft palate + uvula + fauces
- Tonsillar pillars are HIDDEN or only partially visible
- Uvula should be completely visible

CLASS III (Potentially difficult airway):
- Visible: soft palate + only BASE/TIP of uvula
- Fauces and tonsillar pillars are NOT visible
- Only the lower portion of uvula is seen

CLASS IV (Difficult airway):
- ONLY hard palate visible
- Soft palate completely hidden
- No uvula, fauces, or pillars visible

Respond with this exact JSON format:

{
  "mallampatiClass": 1,
  "confidence": 0.85,
  "visibleStructures": ["soft palate", "uvula", "fauces", "tonsillar pillars"],
  "reasoning": "Detailed description of exactly what anatomical structures you can identify and why this leads to your classification"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "この画像から見える口腔内の構造を分析し、Mallampati分類を判定してください。"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    })

    const aiResult = await openaiResponse.json()
    
    if (aiResult.error) {
      throw new Error(aiResult.error.message)
    }

    // Parse AI response
    const content = aiResult.choices[0].message.content
    const analysisResult = JSON.parse(content)

    // Add risk assessment
    const riskLevel = analysisResult.mallampatiClass >= 3 ? 'high' : 'low'
    const recommendation = analysisResult.mallampatiClass >= 3 
      ? '気道確保困難のリスクが高いため、適切な準備と専門医への相談を推奨します。'
      : '気道確保は比較的容易と予想されますが、個別の評価は必要です。'

    const response = {
      success: true,
      data: {
        mallampatiClass: analysisResult.mallampatiClass,
        riskLevel,
        confidence: analysisResult.confidence,
        recommendation,
        details: {
          visibleStructures: analysisResult.visibleStructures,
          reasoning: analysisResult.reasoning
        }
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})