import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("assessment_session_id")?.value
    
    // Fallback to query parameter (from localStorage backup)
    if (!sessionId) {
      const { searchParams } = new URL(request.url)
      sessionId = searchParams.get("sessionId") || undefined
    }
    
    if (!sessionId) {
      return NextResponse.json({ hasResults: false })
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("assessment_results")
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
      results: {
        answers: data.answers,
        strengths: data.strengths,
        growthAreas: data.growth_areas,
        tagCounts: data.tag_counts,
        completedAt: data.completed_at,
      },
    })
  } catch (error) {
    console.error("Error fetching assessment:", error)
    return NextResponse.json({ hasResults: false })
  }
}
