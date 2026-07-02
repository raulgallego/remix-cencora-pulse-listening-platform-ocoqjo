import { createAdminClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { groupName, topProcesses, notes } = await request.json()
    
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("ai_assessment_session")?.value
    
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      cookieStore.set("ai_assessment_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }
    
    const supabase = createAdminClient()
    
    // Check if session already exists
    const { data: existing } = await supabase
      .from("ai_assessment_results")
      .select("id")
      .eq("session_id", sessionId)
      .single()
    
    if (existing) {
      // Update existing result
      const { error } = await supabase
        .from("ai_assessment_results")
        .update({
          group_name: groupName,
          top_processes: topProcesses,
          notes,
          completed_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
      
      if (error) throw error
    } else {
      // Insert new result
      const { error } = await supabase
        .from("ai_assessment_results")
        .insert({
          session_id: sessionId,
          group_name: groupName,
          top_processes: topProcesses,
          notes,
          completed_at: new Date().toISOString(),
        })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true, sessionId })
  } catch (error) {
    console.error("Error saving AI assessment:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
