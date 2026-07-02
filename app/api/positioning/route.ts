import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - fetch positioning data
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from("positioning_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no data exists yet, return zeros
      if (error.code === "PGRST116") {
        return NextResponse.json({
          at_risk: 0,
          competitive: 0,
          differentiated: 0,
          market_leading: 0,
        })
      }
      console.error("Error fetching positioning data:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in positioning GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - save positioning data
export async function POST(request: Request) {
  try {
    const { at_risk, competitive, differentiated, market_leading } = await request.json()
    
    const supabase = createAdminClient()

    // Delete existing record and insert new one (single record pattern)
    await supabase.from("positioning_results").delete().gte("created_at", "1970-01-01T00:00:00.000Z")

    const { data, error } = await supabase
      .from("positioning_results")
      .insert({
        at_risk: at_risk || 0,
        competitive: competitive || 0,
        differentiated: differentiated || 0,
        market_leading: market_leading || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving positioning data:", error)
      return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in positioning POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
