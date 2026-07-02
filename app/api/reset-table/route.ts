import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Allowed tables that can be reset
const ALLOWED_TABLES = [
  "assessment_results",
  "ai_assessment_results",
  "customer_needs_results",
]

export async function POST(request: Request) {
  try {
    const { table } = await request.json()

    // Validate table name
    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Delete all records from the specified table
    // Use created_at filter since all tables have this column and it works with any data type
    const { error } = await supabase
      .from(table)
      .delete()
      .gte("created_at", "1970-01-01T00:00:00.000Z")

    if (error) {
      console.error(`Error resetting ${table}:`, error)
      return NextResponse.json(
        { error: `Failed to reset ${table}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${table} has been reset successfully`,
    })
  } catch (error) {
    console.error("Error in reset-table:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
