import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Only one record should exist - get the most recent one
    const { data, error } = await supabase
      .from("customer_needs_results")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      // No data yet - return empty values
      return NextResponse.json({
        totalResponses: 0,
        aggregated: {
          providers: { value: 0, power: 0, intelligence: 0, innovation: 0, resilience: 0 },
          pharmacies: { value: 0, power: 0, intelligence: 0, innovation: 0, resilience: 0 },
          pharmaManufacturers: { value: 0, power: 0, intelligence: 0, innovation: 0, resilience: 0 },
          healthSystems: { value: 0, power: 0, intelligence: 0, innovation: 0, resilience: 0 },
        },
      })
    }

    // Return the single record's values directly (no aggregation needed)
    const aggregated = {
      providers: {
        value: data.value_providers || 0,
        power: data.power_providers || 0,
        intelligence: data.intelligence_providers || 0,
        innovation: data.innovation_providers || 0,
        resilience: data.resilience_providers || 0,
      },
      pharmacies: {
        value: data.value_pharmacies || 0,
        power: data.power_pharmacies || 0,
        intelligence: data.intelligence_pharmacies || 0,
        innovation: data.innovation_pharmacies || 0,
        resilience: data.resilience_pharmacies || 0,
      },
      pharmaManufacturers: {
        value: data.value_pharma_manufacturers || 0,
        power: data.power_pharma_manufacturers || 0,
        intelligence: data.intelligence_pharma_manufacturers || 0,
        innovation: data.innovation_pharma_manufacturers || 0,
        resilience: data.resilience_pharma_manufacturers || 0,
      },
      healthSystems: {
        value: data.value_health_systems || 0,
        power: data.power_health_systems || 0,
        intelligence: data.intelligence_health_systems || 0,
        innovation: data.innovation_health_systems || 0,
        resilience: data.resilience_health_systems || 0,
      },
    }

    return NextResponse.json({
      totalResponses: 1,
      aggregated,
    })
  } catch (error) {
    console.error("Error in customer needs aggregate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
