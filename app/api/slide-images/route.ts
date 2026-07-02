import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("slide_images")
      .select("*")
      .order("slide_number", { ascending: true })
    
    if (error) {
      console.error("Error fetching slide images:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/slide-images:", error)
    return NextResponse.json({ error: "Failed to fetch slide images" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { slide_number, image_url, title, subtitle } = body
    
    if (!slide_number) {
      return NextResponse.json({ error: "slide_number is required" }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from("slide_images")
      .update({ 
        image_url, 
        title, 
        subtitle,
        updated_at: new Date().toISOString()
      })
      .eq("slide_number", slide_number)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating slide image:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/slide-images:", error)
    return NextResponse.json({ error: "Failed to update slide image" }, { status: 500 })
  }
}
