import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Use a fixed session ID so there's only ever one record that gets replaced
const SINGLE_RECORD_ID = "single-customer-needs-record"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    const body = await request.json()
    const { groupName, values } = body

    // values should be an object like:
    // { resilience: { providers: 5, pharmacies: 3, ... }, power: { ... }, ... }

    // First, delete all existing records to ensure only one record exists
    await supabase
      .from("customer_needs_results")
      .delete()
      .neq("session_id", "impossible-id") // This deletes all rows

    // Then insert the new single record
    const { error } = await supabase
      .from("customer_needs_results")
      .insert({
        session_id: SINGLE_RECORD_ID,
        group_name: groupName,
        // Resilience
        resilience_providers: values.resilience?.providers || 0,
        resilience_pharmacies: values.resilience?.pharmacies || 0,
        resilience_pharma_manufacturers: values.resilience?.pharmaManufacturers || 0,
        resilience_health_systems: values.resilience?.healthSystems || 0,
        // Power
        power_providers: values.power?.providers || 0,
        power_pharmacies: values.power?.pharmacies || 0,
        power_pharma_manufacturers: values.power?.pharmaManufacturers || 0,
        power_health_systems: values.power?.healthSystems || 0,
        // Value
        value_providers: values.value?.providers || 0,
        value_pharmacies: values.value?.pharmacies || 0,
        value_pharma_manufacturers: values.value?.pharmaManufacturers || 0,
        value_health_systems: values.value?.healthSystems || 0,
        // Innovation
        innovation_providers: values.innovation?.providers || 0,
        innovation_pharmacies: values.innovation?.pharmacies || 0,
        innovation_pharma_manufacturers: values.innovation?.pharmaManufacturers || 0,
        innovation_health_systems: values.innovation?.healthSystems || 0,
        // Intelligence
        intelligence_providers: values.intelligence?.providers || 0,
        intelligence_pharmacies: values.intelligence?.pharmacies || 0,
        intelligence_pharma_manufacturers: values.intelligence?.pharmaManufacturers || 0,
        intelligence_health_systems: values.intelligence?.healthSystems || 0,
        completed_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Error saving customer needs:", error)
      return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in customer needs save:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
