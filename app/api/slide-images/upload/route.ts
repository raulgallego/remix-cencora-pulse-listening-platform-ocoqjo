import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const slideNumber = formData.get("slideNumber") as string
    const position = formData.get("position") as string // Position in the collage (0-4)

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!slideNumber) {
      return NextResponse.json({ error: "No slide number provided" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get existing images array
    const { data: existingSlide } = await supabase
      .from("slide_images")
      .select("images, image_url")
      .eq("slide_number", parseInt(slideNumber))
      .single()

    // Parse existing images array or initialize empty
    let images: string[] = []
    if (existingSlide?.images && Array.isArray(existingSlide.images)) {
      images = existingSlide.images
    } else if (existingSlide?.image_url) {
      // Migrate from old single image_url
      images = [existingSlide.image_url]
    }

    // Upload new image to Vercel Blob
    const blob = await put(`slide-images/slide-${slideNumber}-pos-${position || images.length}-${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Add to images array at the specified position or append
    const pos = position !== null && position !== undefined ? parseInt(position) : images.length
    if (pos < images.length) {
      // Delete old image at this position if exists
      if (images[pos]) {
        try {
          await del(images[pos])
        } catch (e) {
          console.error("Failed to delete old blob:", e)
        }
      }
      images[pos] = blob.url
    } else {
      images.push(blob.url)
    }

    // Update database with new images array
    const { error: updateError } = await supabase
      .from("slide_images")
      .update({ 
        images: images,
        image_url: images[0] || null, // Keep image_url in sync for backwards compatibility
        updated_at: new Date().toISOString()
      })
      .eq("slide_number", parseInt(slideNumber))

    if (updateError) {
      console.error("Error updating slide images:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: blob.url, images })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slideNumber, position } = await request.json()

    if (!slideNumber) {
      return NextResponse.json({ error: "No slide number provided" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get existing images array
    const { data: existingSlide } = await supabase
      .from("slide_images")
      .select("images, image_url")
      .eq("slide_number", slideNumber)
      .single()

    let images: string[] = []
    if (existingSlide?.images && Array.isArray(existingSlide.images)) {
      images = [...existingSlide.images]
    } else if (existingSlide?.image_url) {
      images = [existingSlide.image_url]
    }

    // If position is specified, delete just that image
    if (position !== undefined && position !== null && position < images.length) {
      // Delete blob if exists
      if (images[position]) {
        try {
          await del(images[position])
        } catch (e) {
          console.error("Failed to delete blob:", e)
        }
      }
      // Remove from array
      images.splice(position, 1)
    } else {
      // Delete all images
      for (const img of images) {
        if (img) {
          try {
            await del(img)
          } catch (e) {
            console.error("Failed to delete blob:", e)
          }
        }
      }
      images = []
    }

    // Update database
    const { error: updateError } = await supabase
      .from("slide_images")
      .update({ 
        images: images,
        image_url: images[0] || null,
        updated_at: new Date().toISOString()
      })
      .eq("slide_number", slideNumber)

    if (updateError) {
      console.error("Error clearing slide images:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, images })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
