import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// All team names - hardcoded to ensure all teams always appear in dropdown
const ALL_GROUPS = [
  "3PL",
  "Alliance Heathcare",
  "Community Retail and Long-Term Care",
  "Corporate Partnerships",
  "Customer Success & Enablement",
  "Finance",
  "GDATS",
  "Global Pharma Services",
  "Health Systems & Government Services",
  "Human Resources",
  "Innomar",
  "Legal and Corporate Affairs",
  "Marketing, Comms & Policy",
  "MSO",
  "MWI Animal Health",
  "Specialty GPO",
  "Specialty Physician Services",
  "Strategic Global Sourcing",
  "Strategy Enablement Team",
  "US Supply Chain",
  "World Courier"
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupFilter = searchParams.get("group")
    
    const supabase = createAdminClient()

    // Build query - optionally filter by group
    let query = supabase
      .from("ai_assessment_results")
      .select("top_processes, group_name")
      .not("completed_at", "is", null)
    
    if (groupFilter && groupFilter !== "all") {
      query = query.eq("group_name", groupFilter)
    }

    const { data, error } = await query

    if (error) throw error

    // Count how many times each process was selected
    const processCounts: Record<string, number> = {}
    
    // Process each submission's top 3 selections
    data?.forEach((result) => {
      const processes = result.top_processes || []
      processes.forEach((processTitle: string) => {
        processCounts[processTitle] = (processCounts[processTitle] || 0) + 1
      })
    })
    
    // Use hardcoded list of all groups to ensure all teams always appear
    const groups = ALL_GROUPS

    return NextResponse.json({
      processCounts,
      totalResponses: data?.length || 0,
      groups,
    })
  } catch (error) {
    console.error("Error fetching aggregated AI results:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
