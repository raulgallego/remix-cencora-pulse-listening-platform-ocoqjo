import { createAdminClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("ai_assessment_session")?.value
    
    if (sessionId) {
      const supabase = createAdminClient()
      
      // Delete the existing result
      await supabase
        .from("ai_assessment_results")
        .delete()
        .eq("session_id", sessionId)
    }
    
    // Clear the cookie
    cookieStore.delete("ai_assessment_session")
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting AI assessment:", error)
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 })
  }
}
