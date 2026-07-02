import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("ai_assessment_results")
      .select("*")
      .order("completed_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching AI assessment results:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 })
    }
    
    // Create CSV content
    const headers = [
      "ID",
      "Session ID",
      "Group Name",
      "Top Processes",
      "Completed At",
      "Created At"
    ]
    
    const csvRows = [headers.join(",")]
    
    for (const row of data) {
      const values = [
        row.id,
        row.session_id || "",
        `"${(row.group_name || "").replace(/"/g, '""')}"`,
        `"${JSON.stringify(row.top_processes || []).replace(/"/g, '""')}"`,
        row.completed_at || "",
        row.created_at || ""
      ]
      csvRows.push(values.join(","))
    }
    
    const csvContent = csvRows.join("\n")
    
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ai-assessment-results-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
