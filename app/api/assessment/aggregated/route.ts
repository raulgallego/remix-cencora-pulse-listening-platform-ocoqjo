import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Get all completed assessment results
    const { data, error } = await supabase
      .from("assessment_results")
      .select("tag_counts, strengths, growth_areas")
      .not("completed_at", "is", null)

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
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
