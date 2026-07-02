"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, RotateCcw, Search, Check } from "lucide-react"

// Group names - Team list
const GROUP_NAMES = [
  "HR International",
  "HR US",
  "HR Corporate"
]

type TagType = 
  | "Own the outcome"
  | "See around corners"
  | "Elevate people to win"
  | "Match kindness with rigor"
  | "Learn in the arena"
  | "Think beyond your role"

interface Question {
  id: number
  scenario: string
  question: string
  options: {
    text: string
    tag: TagType
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    scenario: "Scenario 1 - A meeting that's going in circles",
    question: "You're in a project meeting where the conversation keeps looping. People are raising good points, but no one is quite landing on what to do next. Time is running short. What are you most likely to do first?",
    options: [
      { text: "Suggest a concrete next move so the group can shift from discussion to action", tag: "Own the outcome" },
      { text: "Pressure-test the leading options by asking what each would set in motion over the next few weeks", tag: "See around corners" },
      { text: "Invite a perspective the group has not heard yet to widen the path forward", tag: "Elevate people to win" },
    ],
  },
  {
    id: 2,
    scenario: "Scenario 2 - A teammate struggling quietly",
    question: "A direct report who usually does strong work has been quieter than usual and has missed a couple of project-related follow-throughs recently. You've worked closely together before, and they trust you. What are you most likely to do first?",
    options: [
      { text: "Check in directly, name what you've noticed, and offer to help them get back on track", tag: "Match kindness with rigor" },
      { text: "Pull them into a visible piece of work where they can rebuild confidence and momentum", tag: "Elevate people to win" },
      { text: "Sit down together to walk through the recent misses and learn what's getting in the way", tag: "Learn in the arena" },
    ],
  },
  {
    id: 3,
    scenario: "Scenario 3 - A decision the team is waiting on",
    question: "Your team needs to choose between two workable ways to move a piece of work forward, and progress is stalled until a direction is set. You have enough context to move ahead, but not every detail is settled yet. What are you most likely to do first?",
    options: [
      { text: "Choose the path forward and spell out the immediate next steps so the team can move with confidence", tag: "Own the outcome" },
      { text: "Outline with the team how each option fits within the enterprise strategy to understand reach and implications", tag: "Think beyond your role" },
      { text: "Compare the two paths with the team, identify the biggest risks in each, and agree how to reduce them before deciding", tag: "See around corners" },
    ],
  },
  {
    id: 4,
    scenario: "Scenario 4 - A promising idea",
    question: "In a discussion with your team, someone raises an idea that could improve how the work gets done, but it doesn't get much attention. You catch it and think it's worth exploring. What are you most likely to do first?",
    options: [
      { text: "Suggest taking a few minutes now to sketch how the idea could work in practice", tag: "Learn in the arena" },
      { text: "Invite the person who raised it to say more about what they are seeing and how they would take it forward", tag: "Elevate people to win" },
      { text: "Ask what this idea could change for the team a few months from now if it works", tag: "See around corners" },
    ],
  },
  {
    id: 5,
    scenario: "Scenario 5 - The conversation is narrowing",
    question: "You're in a discussion about how to approach a piece of work. A couple of strong opinions are shaping the direction, but it's still early and the team hasn't explored many options yet. What are you most likely to do first?",
    options: [
      { text: "Invite a voice the group has not heard from yet to widen the discussion", tag: "Elevate people to win" },
      { text: "Acknowledge the strong opinions and invite the group to stress-test them directly and constructively", tag: "Match kindness with rigor" },
      { text: "Share with the group about a similar effort elsewhere and offer to connect the group with a colleague in that area to learn from their efforts", tag: "Think beyond your role" },
    ],
  },
  {
    id: 6,
    scenario: "Scenario 6 - Work that keeps slowing down",
    question: "Over the past few weeks, a recurring piece of work has started taking longer than it used to. You can feel friction building, but no one has named it. What are you most likely to do first?",
    options: [
      { text: "Ask someone involved to walk you through the work step by step so you can see exactly where it bogs down", tag: "Learn in the arena" },
      { text: "Call a quick reset to name the slowdown and agree on one immediate change to test", tag: "Own the outcome" },
      { text: "Ask what changes can be made to reduce friction and how that might impact the team and its stakeholders", tag: "See around corners" },
    ],
  },
  {
    id: 7,
    scenario: "Scenario 7 - A stretch opportunity",
    question: "A teammate volunteers to take on something new they haven't done before. They're excited but unsure where to start and ask for your guidance. What are you most likely to do first?",
    options: [
      { text: "Offer to collaborate on a first pass and share how you'd approach it", tag: "Elevate people to win" },
      { text: "Encourage them to draft a proposed approach—even if it's not fully formed—and pressure-test it with you and the team", tag: "Learn in the arena" },
      { text: "Suggest looping in someone who has done similar work so they can learn from that perspective", tag: "Think beyond your role" },
    ],
  },
  {
    id: 8,
    scenario: "Scenario 8 - A problem across teams",
    question: "An issue has come up that cuts across multiple teams, and each group is starting to move in slightly different directions. You can see this becoming a bigger problem if it's not aligned soon. What are you most likely to do first?",
    options: [
      { text: "Propose a coordination plan with clear owners and timing to create clarity and maintain momentum", tag: "Own the outcome" },
      { text: "Bring together the leads from each team so the group can align with the right perspectives in the room", tag: "Think beyond your role" },
      { text: "Show what the teams stand to lose if they keep diverging and use that to align them around one path quickly", tag: "See around corners" },
    ],
  },
  {
    id: 9,
    scenario: "Scenario 9 - A missed milestone",
    question: "A milestone passes and the team didn't quite get there. There's silence and a sense of frustration in the room. What are you most likely to do first?",
    options: [
      { text: "Suggest stepping back to capture what the team learned from the experience", tag: "Learn in the arena" },
      { text: "Address what happened directly and set up a constructive conversation about what needs to change next", tag: "Match kindness with rigor" },
      { text: "Zoom out to understand who else may be affected by the delay and what needs to be communicated now", tag: "Think beyond your role" },
    ],
  },
  {
    id: 10,
    scenario: "Scenario 10 - A team under pressure",
    question: "As a deadline approaches, small tensions are turning into visible friction between teammates. You can feel it affecting how the work is getting done. What are you most likely to do first?",
    options: [
      { text: "Name the tension directly, reset the tone, and refocus the team on what matters most to deliver", tag: "Match kindness with rigor" },
      { text: "Reprioritize the work into a clear sequence of next steps so the team can feel comfortable with what to expect next", tag: "Own the outcome" },
      { text: "Remind the team of the impact of the work to recenter on purpose as they move forward", tag: "Think beyond your role" },
    ],
  },
  {
    id: 11,
    scenario: "Scenario 11 - A recurring question",
    question: "Your team keeps encountering the same question across projects, and each time it's solved a different way. You see an opportunity to make this more efficient. What are you most likely to do first?",
    options: [
      { text: "Review how the team has handled it before and use what worked best to define a preferred approach for the next project", tag: "Learn in the arena" },
      { text: "Ask a teammate who's ready for more ownership to shape a clear approach—and coach them as they build it for the team", tag: "Elevate people to win" },
      { text: "Propose a preferred approach and invite constructive builds and pressure-testing before the team adopts it", tag: "Match kindness with rigor" },
    ],
  },
  {
    id: 12,
    scenario: "Scenario 12 - After a big push",
    question: "Your team has just wrapped a demanding push. People are proud, but tired—and the next phase is already starting with little time to pause or reflect on what was learned. What are you most likely to do first?",
    options: [
      { text: "Create space to recognize the team's effort and capture a few key takeaways before moving on", tag: "Elevate people to win" },
      { text: "Connect what just happened to what's coming next so the team can make smarter choices in the next phase", tag: "See around corners" },
      { text: "Start organizing the next phase so momentum is not lost", tag: "Own the outcome" },
    ],
  },
]

const tagDescriptions: Record<TagType, string> = {
  "Own the outcome": "Taking responsibility for results and driving work forward with clarity and commitment.",
  "See around corners": "Anticipating challenges, considering future implications, and thinking strategically about what lies ahead.",
  "Elevate people to win": "Empowering others, creating opportunities for growth, and helping people reach their potential.",
  "Match kindness with rigor": "Balancing empathy and accountability, addressing issues directly while maintaining respect and support.",
  "Learn in the arena": "Embracing experimentation, learning by doing, and building knowledge through active engagement.",
  "Think beyond your role": "Considering broader impact, connecting with other teams, and seeing the bigger picture.",
}

function CencoraLogo({ variant = "dark", size = "default" }: { variant?: "dark" | "light"; size?: "default" | "large" }) {
  const sizeClass = size === "large" 
    ? "text-5xl md:text-6xl lg:text-7xl" 
    : "text-4xl md:text-5xl"
  const colorClass = variant === "light" ? "text-white" : "text-[#461E96]"
  
  return (
    <span className={`${sizeClass} ${colorClass} font-light tracking-wider`}>
      cencora
    </span>
  )
}

interface SavedResults {
  answers: TagType[]
  strengths: TagType[]
  growthAreas: TagType[]
  tagCounts: Record<TagType, number>
  completedAt: string
}

interface AggregatedData {
  totalResponses: number
  tagCounts: Record<string, number>
  strengthsCounts: Record<string, number>
  growthAreasCounts: Record<string, number>
  teamName?: string
}

type ResultView = "yours" | "team" | "all"

export default function Assessment() {
  const [stage, setStage] = useState<"loading" | "intro" | "groupSelect" | "questions" | "results">("loading")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<TagType[]>([])
  const [savedResults, setSavedResults] = useState<SavedResults | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupSearch, setGroupSearch] = useState("")
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const groupInputRef = useRef<HTMLInputElement>(null)
  
  // Results view state
  const [resultView, setResultView] = useState<ResultView>("yours")
  const [teamData, setTeamData] = useState<AggregatedData | null>(null)
  const [isLoadingAggregated, setIsLoadingAggregated] = useState(false)
  
  // Filter groups based on search
  const filteredGroups = GROUP_NAMES.filter(group => 
    group.toLowerCase().includes(groupSearch.toLowerCase())
  ).sort((a, b) => a.localeCompare(b))

  // Fetch aggregated data for team
  const fetchAggregatedData = useCallback(async (team?: string) => {
    setIsLoadingAggregated(true)
    try {
      // Fetch team data
      if (team) {
        const teamRes = await fetch(`/api/assessment/aggregated/team?team=${encodeURIComponent(team)}`)
        const teamJson = await teamRes.json()
        setTeamData(teamJson)
      }
    } catch (error) {
      console.error("Error fetching aggregated data:", error)
    } finally {
      setIsLoadingAggregated(false)
    }
  }, [])

  // Check for existing results on load
  useEffect(() => {
    async function checkExistingResults() {
      try {
        // Check localStorage for sessionId backup
        const storedSessionId = localStorage.getItem("assessment_session_id")
        
        // Pass sessionId as query param if available (fallback for when cookies are cleared)
        const url = storedSessionId 
          ? `/api/assessment/results?sessionId=${storedSessionId}`
          : "/api/assessment/results"
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.hasResults && data.results) {
          setSavedResults(data.results)
          setAnswers(data.results.answers || [])
          if (data.groupName) {
            setGroupName(data.groupName)
            setGroupSearch(data.groupName)
            // Fetch aggregated data when results exist
            fetchAggregatedData(data.groupName)
          }
          setStage("results")
        } else {
          // Check if they have a group from assessment-2
          if (data.groupName) {
            setGroupName(data.groupName)
            setGroupSearch(data.groupName)
          } else {
            // Try to get group from AI assessment
            try {
              const aiRes = await fetch("/api/ai-assessment/results", { credentials: "include" })
              const aiData = await aiRes.json()
              if (aiData.groupName) {
                setGroupName(aiData.groupName)
                setGroupSearch(aiData.groupName)
              }
            } catch {
              // Ignore errors from AI assessment check
            }
          }
          setStage("intro")
        }
      } catch {
        setStage("intro")
      }
    }
    
    checkExistingResults()
  }, [fetchAggregatedData])

  const handleStart = () => {
    setStage("groupSelect")
  }
  
  const handleGroupSelect = (group: string) => {
    setGroupName(group)
    setGroupSearch(group)
    setShowGroupDropdown(false)
    // Scroll to top after selection to show the logo
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
  
  const handleGroupContinue = () => {
    if (groupName) {
      setStage("questions")
    }
  }

  const saveResults = useCallback(async (finalAnswers: TagType[]) => {
    setIsSaving(true)
    try {
      const counts: Record<TagType, number> = {
        "Own the outcome": 0,
        "See around corners": 0,
        "Elevate people to win": 0,
        "Match kindness with rigor": 0,
        "Learn in the arena": 0,
        "Think beyond your role": 0,
      }

      finalAnswers.forEach(tag => {
        counts[tag]++
      })

      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([tag]) => tag as TagType)

      const strengths = sorted.slice(0, 2)
      const growthAreas = sorted.filter(tag => counts[tag] < counts[strengths[0]]).slice(-2)

      const saveRes = await fetch("/api/assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          strengths,
          growthAreas,
          tagCounts: counts,
          groupName,
        }),
      })
      
      // Store sessionId in localStorage as backup
      const saveData = await saveRes.json()
      if (saveData.sessionId) {
        localStorage.setItem("assessment_session_id", saveData.sessionId)
      }

      setSavedResults({
        answers: finalAnswers,
        strengths,
        growthAreas,
        tagCounts: counts,
        completedAt: new Date().toISOString(),
      })
      
      // Fetch aggregated data after saving
      fetchAggregatedData(groupName)
    } catch (err) {
      console.error("Failed to save results:", err)
    } finally {
      setIsSaving(false)
    }
  }, [groupName, fetchAggregatedData])

  const handleAnswer = (tag: TagType, optionIndex: number) => {
    if (isTransitioning) return
    
    setSelectedOption(optionIndex)
    setIsTransitioning(true)
    
    const newAnswers = [...answers, tag]
    setAnswers(newAnswers)

    // Delay transition to show selected state
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        saveResults(newAnswers)
        setStage("results")
      }
      setIsTransitioning(false)
    }, 400)
  }

  const calculateResults = () => {
    const counts: Record<TagType, number> = {
      "Own the outcome": 0,
      "See around corners": 0,
      "Elevate people to win": 0,
      "Match kindness with rigor": 0,
      "Learn in the arena": 0,
      "Think beyond your role": 0,
    }

    answers.forEach(tag => {
      counts[tag]++
    })

    // Sort by count descending
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag: tag as TagType, count }))

    // Top 2 are strengths
    const strengths = sorted.filter(s => s.count > 0).slice(0, 2)
    
    // Find areas for growth (tags with 0 or low counts)
    const growthAreas = sorted.filter(s => s.count === 0 || s.count < sorted[0].count).slice(-2)

    return { counts, strengths, growthAreas, sorted }
  }

  const handleRestart = async () => {
    // Clear the cookie by making a request that will reset it
    try {
      await fetch("/api/assessment/reset", { method: "POST" })
    } catch {
      // Continue even if reset fails
    }
    setSavedResults(null)
    setStage("intro")
    setCurrentQuestion(0)
    setAnswers([])
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/assessment-background.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[100dvh] flex flex-col items-center justify-center relative z-10"
          >
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto" />
              <p className="text-white/80">Loading your assessment...</p>
            </div>
          </motion.div>
        )}

        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
          >
            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-5 md:px-8 pb-8 pt-12 md:pt-16">
              <div className="max-w-lg w-full mx-auto">
                <div className="mb-10 md:mb-12 flex justify-center">
                  <CencoraLogo variant="light" size="large" />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <p className="text-white/90 text-lg md:text-xl leading-tight mb-4">
                    Active Learning and Active Leading show up in how we listen, learn, act, and support others. These everyday moments shape how we move work forward and build our future.
                  </p>
                  <p className="text-white text-base md:text-lg leading-tight mb-4">
                    Answer a few questions about how you'd respond in everyday scenarios and choose what you are most likely to do <span className="font-bold">first</span>. There are no right answers!
                  </p>
                  <p className="text-white text-base md:text-lg font-bold leading-tight mb-4">
                    At the end, you'll see where you naturally lean as an active learner and leader—and where you might try something new.
                  </p>
                  <p className="text-white/80 text-sm md:text-base leading-tight mb-8 italic">
                    This tool is not a diagnostic. It offers an indication of where you may feel most comfortable. In the coming months, we&apos;ll roll out additional tools to help you better understand your performance in each Standard.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  onClick={handleStart}
                  className="group flex items-center justify-center gap-2 w-full bg-white text-[#461E96] px-6 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-[#00DC8C] hover:text-[#461E96] transition-all duration-300 shadow-lg"
                >
                  Begin assessment
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </main>
          </motion.div>
        )}

        {stage === "groupSelect" && (
          <motion.div
            key="groupSelect"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
                >
                  {/* Main content */}
                  <main className="flex-1 flex flex-col px-5 md:px-8 pb-8 pt-12 md:pt-16">
              <div className="max-w-lg w-full mx-auto">
                <div className="mb-10 flex justify-center">
                  <CencoraLogo variant="light" size="large" />
                </div>
                
                <div className="mb-10 md:mb-12 flex flex-col items-center text-center">
                  <h2 className="text-white text-4xl md:text-5xl">
                    The Next Chapter of<br />Active Learning and Active Leading
                  </h2>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <p className="text-white text-xl md:text-2xl mb-2">
                    Please select your team name.
                  </p>
                  <p className="text-white/70 text-base md:text-lg mb-8">
                    Type the first letters of your team
                  </p>
                  
                  {/* Searchable autocomplete input */}
                  <div className="relative mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        ref={groupInputRef}
                        type="text"
                        value={groupSearch}
                        onChange={(e) => {
                          setGroupSearch(e.target.value)
                          setShowGroupDropdown(true)
                          if (!GROUP_NAMES.includes(e.target.value)) {
                            setGroupName("")
                          }
                        }}
                        onFocus={() => setShowGroupDropdown(true)}
                        placeholder="Search for your team..."
                        className="w-full pl-12 pr-12 py-4 rounded-xl text-lg bg-white text-[#461E96] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#00DC8C]/50 shadow-lg"
                      />
                      {groupName && (
                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0BB975]" />
                      )}
                    </div>
                    
                    {/* Dropdown */}
                    <AnimatePresence>
                      {showGroupDropdown && groupSearch && filteredGroups.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-20 max-h-60 overflow-y-auto"
                        >
                          {filteredGroups.map((group) => (
                            <button
                              key={group}
                              onClick={() => handleGroupSelect(group)}
                              className={`w-full text-left px-4 py-3 text-base transition-colors ${
                                groupName === group 
                                  ? 'bg-[#00DC8C]/20 text-[#461E96] font-semibold' 
                                  : 'text-[#461E96] hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{group}</span>
                                {groupName === group && <Check className="w-4 h-4 text-[#0BB975]" />}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Selected group display */}
                  {groupName && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#00DC8C]/20 border border-[#00DC8C] rounded-xl p-4 mb-6"
                    >
                      <p className="text-white text-sm font-medium mb-1">Selected team:</p>
                      <p className="text-[#00DC8C] text-xl font-bold">{groupName}</p>
                    </motion.div>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  onClick={handleGroupContinue}
                  disabled={!groupName}
                  className={`group flex items-center justify-center gap-2 w-full px-6 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl transition-all duration-300 shadow-lg ${
                    groupName 
                      ? 'bg-white text-[#461E96] hover:bg-[#00DC8C] hover:text-[#461E96]' 
                      : 'bg-white/30 text-white/50 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </main>
          </motion.div>
        )}

        {stage === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
                >
                  {/* Header */}
                  <header className="px-5 pt-8 pb-3 md:pt-10 md:px-8 md:pb-4 flex items-center justify-end">
                    <div className="text-white/70 text-base md:text-lg font-medium">
                      {currentQuestion + 1} / {questions.length}
                    </div>
                  </header>
            
            {/* Progress bar */}
            <div className="px-5 md:px-8 mb-6 md:mb-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#00DC8C]"
                  initial={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question content */}
            <main className="flex-1 flex flex-col px-5 md:px-8 py-4 md:py-6">
              <div className="max-w-xl w-full mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mb-4 md:mb-6">
                      <p className="text-white text-lg md:text-2xl font-semibold leading-snug">
                        {questions[currentQuestion].question.split("What are you most likely to do first?")[0]}
                      </p>
                    </div>
                    
                    <p className="text-white text-lg md:text-2xl mb-3 md:mb-4">
                      What are you most likely to do <span className="font-bold">first</span>?
                    </p>

                    <div className="space-y-3 md:space-y-4">
                      {questions[currentQuestion].options.map((option, index) => {
                        const isSelected = selectedOption === index
                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0,
                              scale: isSelected ? 0.98 : 1,
                            }}
                            transition={{ 
                              delay: index * 0.1,
                              scale: { duration: 0.15 },
                            }}
                            onClick={() => handleAnswer(option.tag, index)}
                            disabled={isTransitioning}
                            className={`relative w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-200 ${
                              isSelected 
                                ? 'bg-white shadow-lg' 
                                : 'bg-white/70 hover:bg-white/80'
                            } ${isTransitioning && !isSelected ? 'opacity-40' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                                isSelected 
                                  ? 'border-[#461E96] bg-[#461E96]' 
                                  : 'border-[#461E96]'
                              }`}>
                                {isSelected && (
                                  <motion.svg 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </motion.svg>
                                )}
                              </div>
                              <span className="text-[#461E96] text-base md:text-xl leading-snug md:leading-relaxed font-semibold">{option.text}</span>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
                  className="min-h-[100dvh] flex flex-col relative z-10 pt-4 md:pt-8"
                >
                  {/* Toggle Navigation */}
            <div className="px-5 md:px-8 mb-4">
              <div className="max-w-lg mx-auto">
                <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
                  {[
                    { key: "yours" as ResultView, label: "Your Results" },
                    { key: "team" as ResultView, label: "Your Team" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setResultView(tab.key)}
                      className={`flex-1 py-2 px-3 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                        resultView === tab.key
                          ? "bg-white text-[#461E96] shadow-md"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results content */}
            <main className="flex-1 flex flex-col px-5 md:px-8 py-2 md:py-4 overflow-auto">
              <AnimatePresence mode="wait">
                {/* Your Results View */}
                {resultView === "yours" && (
                  <motion.div
                    key="yours-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-lg w-full mx-auto"
                >
                  {/* Cencora Logo - centered above card */}
                  <div className="flex justify-center mb-8">
                    <CencoraLogo variant="light" size="large" />
                  </div>
                  
                  {isSaving ? (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                        <p className="text-white text-base">Saving your results...</p>
                      </div>
                    ) : (
                      (() => {
                        const results = savedResults ? {
                          counts: savedResults.tagCounts,
                        } : calculateResults()

                        const allTags = Object.entries(results.counts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([tag, count]) => ({ tag, count }))

                        return (
                          <>
                            {/* Congrats message - above card with white text */}
                            <div className="mb-6">
                              <p className="text-white text-sm md:text-base leading-relaxed">
                                <span className="font-bold">Congrats!</span> You are already using aspects of Active Learning and Active Leading in your work—bringing these Standards to life in how you approach decisions, collaborate with others, and move work forward.
                              </p>
                            </div>

                            {/* White card with standards */}
                            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg">
                              {/* Standards explanation */}
                              <p className="text-[#461E96] text-sm md:text-base leading-snug mb-5">
                                Based on <em>your</em> responses, here are the standards of Active Learning and Active Leading you may be most likely to start with in everyday moments:
                              </p>
                              
                              {/* Standards list */}
                              <ul className="space-y-0">
                                {allTags.map(({ tag, count }, index) => (
                                  <motion.li
                                    key={tag}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    className={`flex items-center justify-between py-3 ${
                                      index < allTags.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <span className="w-2 h-2 rounded-full mr-3 flex-shrink-0 bg-[#461E96]" />
                                      <span className="text-[#461E96] text-sm md:text-base font-bold">{tag}</span>
                                    </div>
                                    <span className="font-bold text-[#461E96] text-base md:text-lg">{count}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>

                            {/* Restart button below card */}
                            <button
                              onClick={handleRestart}
                              className="w-full mt-6 flex items-center justify-center gap-2 bg-white text-[#461E96] py-3 rounded-full font-bold text-sm md:text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Take assessment again
                            </button>
                          </>
                        )
                      })()
                    )}
                  </motion.div>
                )}

                {/* Team Results View */}
                {resultView === "team" && (
                  <motion.div
                    key="team-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-lg w-full mx-auto"
                >
                  {/* Cencora Logo - centered above card */}
                  <div className="flex justify-center mb-8">
                    <CencoraLogo variant="light" size="large" />
                  </div>
                  
                  {isLoadingAggregated ? (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                        <p className="text-white text-base">Loading team data...</p>
                      </div>
                    ) : teamData && teamData.totalResponses > 0 ? (
                      <>
                        {/* Team info message - above card with white text */}
                        <div className="mb-6">
                          <p className="text-white text-sm md:text-base leading-relaxed">
                            <span className="inline-block bg-[#00DC8C] text-[#461E96] font-bold px-3 py-0.5 rounded-full">{groupName || "Your Team"}</span> has {teamData.totalResponses} {teamData.totalResponses === 1 ? 'response' : 'responses'}. Here&apos;s where your team naturally leans when it comes to Active Learning and Active Leading.
                          </p>
                        </div>

                        {/* White card with standards */}
                        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg">
                          {/* Standards explanation */}
                          <p className="text-[#461E96] text-sm md:text-base leading-snug mb-5">
                            Based on <em>your team&apos;s</em> responses, here are the standards of Active Learning and Active Leading your team may be most likely to start with:
                          </p>
                          
                          {/* Standards list */}
                          <ul className="space-y-0">
                            {Object.entries(teamData.tagCounts)
                              .sort(([, a], [, b]) => b - a)
                              .map(([tag, count], index, arr) => (
                                <motion.li
                                  key={tag}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + index * 0.05 }}
                                  className={`flex items-center justify-between py-3 ${
                                    index < arr.length - 1 ? 'border-b border-gray-100' : ''
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full mr-3 flex-shrink-0 bg-[#461E96]" />
                                    <span className="text-[#461E96] text-sm md:text-base font-bold">{tag}</span>
                                  </div>
                                  <span className="font-bold text-[#461E96] text-base md:text-lg">{count}</span>
                                </motion.li>
                              ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg text-center">
                        <p className="text-[#461E96]/60 text-sm">No team data available yet.</p>
                        <p className="text-[#461E96]/40 text-xs mt-1">Be the first from your team to complete the assessment!</p>
                      </div>
                    )}
                  </motion.div>
                )}


              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
