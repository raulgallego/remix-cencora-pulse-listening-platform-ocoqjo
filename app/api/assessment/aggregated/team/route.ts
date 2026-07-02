import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const teamName = searchParams.get("team")

    // Build query
    let query = supabase
      .from("assessment_results")
      .select("tag_counts, strengths, growth_areas, group_name")
      .not("completed_at", "is", null)

    // Filter by team if specified
    if (teamName) {
      query = query.eq("group_name", teamName)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching results:", error)
      return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        totalResponses: 0,
        tagCounts: {},
        strengthsCounts: {},
        growthAreasCounts: {},
        teamName: teamName || "All Teams",
      })
    }

    // Aggregate tag counts
    const aggregatedTagCounts: Record<string, number> = {}
    const strengthsCounts: Record<string, number> = {}
    const growthAreasCounts: Record<string, number> = {}

    data.forEach((result) => {
      // Aggregate tag counts
      if (result.tag_counts) {
        Object.entries(result.tag_counts).forEach(([tag, count]) => {
          aggregatedTagCounts[tag] = (aggregatedTagCounts[tag] || 0) + (count as number)
        })
      }

      // Count strengths
      if (result.strengths) {
        (result.strengths as string[]).forEach((strength) => {
          strengthsCounts[strength] = (strengthsCounts[strength] || 0) + 1
        })
      }

      // Count growth areas
      if (result.growth_areas) {
        (result.growth_areas as string[]).forEach((area) => {
          growthAreasCounts[area] = (growthAreasCounts[area] || 0) + 1
        })
      }
    })

    return NextResponse.json({
      totalResponses: data.length,
      tagCounts: aggregatedTagCounts,
      strengthsCounts,
      growthAreasCounts,
      teamName: teamName || "All Teams",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
