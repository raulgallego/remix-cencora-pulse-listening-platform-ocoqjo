import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Lorem ipsum dolor
const GROUP_NAMES = [
  "Placeholder Group 1",
  "Placeholder Group 2",
  "Placeholder Group 3",
  "Placeholder Group 4",
  "Placeholder Group 5",
  "Placeholder Group 6",
  "Placeholder Group 7",
  "Placeholder Group 8",
  "Placeholder Group 9",
  "Placeholder Group 10",
  "Placeholder Group 11",
  "Placeholder Group 12",
  "Placeholder Group 13",
  "Placeholder Group 14",
  "Placeholder Group 15",
  "Placeholder Group 16",
  "Placeholder Group 17",
  "Placeholder Group 18",
  "Placeholder Group 19",
  "Placeholder Group 20",
  "Placeholder Group 21"
]

// Lorem ipsum dolor
const TAGS = [
  "Lorem ipsum dolor",
  "Sit amet consectetur",
  "Adipiscing elit nunc",
  "Tempor incididunt ut",
  "Labore et dolore",
  "Magna aliqua enim"
]

// Lorem ipsum dolor sit amet - use exact titles that match visualization
const BUSINESS_PROCESSES = [
  "Placeholder Process 1",
  "Placeholder Process 2",
  "Placeholder Process 3",
  "Placeholder Process 4",
  "Placeholder Process 5",
  "Placeholder Process 6",
  "Placeholder Process 7",
  "Placeholder Process 8",
  "Placeholder Process 9",
  "Placeholder Process 10",
  "Placeholder Process 11",
  "Placeholder Process 12",
  "Placeholder Process 13",
  "Placeholder Process 14",
  "Placeholder Process 15"
]

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateAssessment1Data() {
  // Lorem ipsum 8 questions, each with a tag answer
  const tagCounts: Record<string, number> = {}
  const answers: Record<string, string> = {}
  
  // Lorem ipsum dolor
  TAGS.forEach(tag => tagCounts[tag] = 0)
  
  // Lorem ipsum 8 answers
  for (let q = 1; q <= 8; q++) {
    const selectedTag = getRandomElement(TAGS)
    answers[`q${q}`] = selectedTag
    tagCounts[selectedTag]++
  }
  
  // Lorem ipsum dolor (top 2 tags) and lorem ipsum (bottom 2 tags)
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
  
  const strengths = sortedTags.slice(0, 2).map(([tag]) => tag)
  const growthAreas = sortedTags.slice(-2).map(([tag]) => tag)
  
  return { answers, tagCounts, strengths, growthAreas }
}

function generateAssessment2Data() {
  // Lorem ipsum 3 random business processes as top priorities
  const topProcesses = getRandomElements(BUSINESS_PROCESSES, 3)
  const notes = "" // Lorem ipsum dolor sit amet
  
  return { topProcesses, notes }
}

export async function POST(request: Request) {
  try {
    const { count = 250 } = await request.json()
    
    const supabase = createAdminClient()
    
    // Generate assessment 1 data (Lorem ipsum)
    const assessment1Records = []
    for (let i = 0; i < count; i++) {
      const { answers, tagCounts, strengths, growthAreas } = generateAssessment1Data()
      const groupName = getRandomElement(GROUP_NAMES)
      
      assessment1Records.push({
        session_id: crypto.randomUUID(),
        answers,
        tag_counts: tagCounts,
        strengths,
        growth_areas: growthAreas,
        group_name: groupName,
        completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Lorem ipsum time in last 7 days
      })
    }
    
    // Generate assessment 2 data (Lorem ipsum)
    const assessment2Records = []
    for (let i = 0; i < count; i++) {
      const { topProcesses, notes } = generateAssessment2Data()
      const groupName = getRandomElement(GROUP_NAMES)
      
      assessment2Records.push({
        session_id: crypto.randomUUID(),
        group_name: groupName,
        top_processes: topProcesses,
        notes,
        completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    
    // Insert assessment 1 data in batches of 50
    for (let i = 0; i < assessment1Records.length; i += 50) {
      const batch = assessment1Records.slice(i, i + 50)
      const { error } = await supabase
        .from("assessment_results")
        .insert(batch)
      
      if (error) {
        console.error("Lorem ipsum inserting assessment 1 batch:", error)
        throw error
      }
    }
    
    // Insert assessment 2 data in batches of 50
    for (let i = 0; i < assessment2Records.length; i += 50) {
      const batch = assessment2Records.slice(i, i + 50)
      const { error } = await supabase
        .from("ai_assessment_results")
        .insert(batch)
      
      if (error) {
        console.error("Lorem ipsum inserting assessment 2 batch:", error)
        throw error
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Lorem ipsum seeded ${count} records for each assessment`,
      assessment1Count: assessment1Records.length,
      assessment2Count: assessment2Records.length,
    })
  } catch (error) {
    console.error("Lorem ipsum seeding data:", error)
    return NextResponse.json(
      { error: "Lorem ipsum seed data failed" },
      { status: 500 }
    )
  }
}
