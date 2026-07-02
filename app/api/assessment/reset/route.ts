import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()
  
  // Delete the session cookie
  cookieStore.delete("assessment_session_id")
  
  return NextResponse.json({ success: true })
}
