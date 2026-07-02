import { createAdminClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("customer_needs_session")?.value
    
    // Fallback to query parameter
    if (!sessionId) {
      const { searchParams } = new URL(request.url)
      sessionId = searchParams.get("sessionId") || undefined
    }
    
    if (!sessionId) {
      return NextResponse.json({ hasResults: false })
    }

    const { data, error } = await supabase
      .from("customer_needs_results")
      .select("*")
      .eq("session_id", sessionId)
      .single()

    if (error || !data) {
      return NextResponse.json({ hasResults: false })
    }

    return NextResponse.json({
      hasResults: true,
      groupName: data.group_name,
      values: {
        resilience: {
          providers: data.resilience_providers,
          pharmacies: data.resilience_pharmacies,
          pharmaManufacturers: data.resilience_pharma_manufacturers,
          healthSystems: data.resilience_health_systems,
        },
        power: {
          providers: data.power_providers,
          pharmacies: data.power_pharmacies,
          pharmaManufacturers: data.power_pharma_manufacturers,
          healthSystems: data.power_health_systems,
        },
        value: {
          providers: data.value_providers,
          pharmacies: data.value_pharmacies,
          pharmaManufacturers: data.value_pharma_manufacturers,
          healthSystems: data.value_health_systems,
        },
        innovation: {
          providers: data.innovation_providers,
          pharmacies: data.innovation_pharmacies,
          pharmaManufacturers: data.innovation_pharma_manufacturers,
          healthSystems: data.innovation_health_systems,
        },
        intelligence: {
          providers: data.intelligence_providers,
          pharmacies: data.intelligence_pharmacies,
          pharmaManufacturers: data.intelligence_pharma_manufacturers,
          healthSystems: data.intelligence_health_systems,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching customer needs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
