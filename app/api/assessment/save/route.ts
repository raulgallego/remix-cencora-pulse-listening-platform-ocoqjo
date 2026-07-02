import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { answers, strengths, growthAreas, tagCounts, groupName } = await request.json()
    
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("assessment_session_id")?.value
    
    // Generate new session ID if none exists
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }
    
    const supabase = await createClient()
    
    // Check if result already exists for this session
    const { data: existing } = await supabase
      .from("assessment_results")
      .select("id")
      .eq("session_id", sessionId)
      .single()
    
    if (existing) {
      // Update existing result
      const { error } = await supabase
        .from("assessment_results")
        .update({
          answers,
          strengths,
          growth_areas: growthAreas,
          tag_counts: tagCounts,
          group_name: groupName,
          completed_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
      
      if (error) throw error
    } else {
      // Insert new result
      const { error } = await supabase
        .from("assessment_results")
        .insert({
          session_id: sessionId,
          answers,
          strengths,
          growth_areas: growthAreas,
          tag_counts: tagCounts,
          group_name: groupName,
          completed_at: new Date().toISOString(),
        })
      
      if (error) throw error
    }
    
    // Set cookie to persist session (1 year expiry)
    const response = NextResponse.json({ success: true, sessionId })
    response.cookies.set("assessment_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    
    return response
  } catch (error) {
    console.error("Error saving assessment:", error)
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    )
  }
}
