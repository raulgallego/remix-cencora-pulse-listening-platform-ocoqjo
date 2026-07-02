import { createAdminClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("ai_assessment_session")?.value
    
    // Fallback to query parameter (from localStorage backup)
    if (!sessionId) {
      const { searchParams } = new URL(request.url)
      sessionId = searchParams.get("sessionId") || undefined
    }
    
    if (!sessionId) {
      return NextResponse.json({ hasResults: false })
    }
    
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from("ai_assessment_results")
      .select("*")
      .eq("session_id", sessionId)
      .single()
    
    if (error || !data) {
      return NextResponse.json({ hasResults: false })
    }
    
    // Always return groupName if available, even if assessment not completed
    if (!data.completed_at) {
      return NextResponse.json({ 
        hasResults: false,
        groupName: data.group_name 
      })
    }
    
    return NextResponse.json({
      hasResults: true,
      groupName: data.group_name,
      topProcesses: data.top_processes,
      notes: data.notes,
    })
  } catch {
    return NextResponse.json({ hasResults: false })
  }
}
