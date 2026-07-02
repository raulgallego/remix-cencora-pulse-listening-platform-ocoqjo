import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .order("completed_at", { ascending: false })
    
    if (error) throw error
    
    // Transform data for CSV export
    const csvHeaders = [
      "ID",
      "Session ID",
      "Group Name",
      "Completed At",
      "Strength 1",
      "Strength 2",
      "Growth Area 1",
      "Growth Area 2",
      "Own the Outcome Count",
      "See Around Corners Count",
      "Elevate People to Win Count",
      "Match Kindness with Rigor Count",
      "Learn in the Arena Count",
      "Think Beyond Your Role Count",
    ]
    
    const csvRows = data.map((row) => {
      const tagCounts = row.tag_counts as Record<string, number>
      return [
        row.id,
        row.session_id,
        row.group_name || "",
        row.completed_at,
        row.strengths[0] || "",
        row.strengths[1] || "",
        row.growth_areas[0] || "",
        row.growth_areas[1] || "",
        tagCounts["Own the outcome"] || 0,
        tagCounts["See around corners"] || 0,
        tagCounts["Elevate people to win"] || 0,
        tagCounts["Match kindness with rigor"] || 0,
        tagCounts["Learn in the arena"] || 0,
        tagCounts["Think beyond your role"] || 0,
      ].join(",")
    })
    
    const csv = [csvHeaders.join(","), ...csvRows].join("\n")
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="assessment-results-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting assessments:", error)
    return NextResponse.json(
      { error: "Failed to export assessments" },
      { status: 500 }
    )
  }
}
