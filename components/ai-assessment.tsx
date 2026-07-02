"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronDown, Search, Check, X } from "lucide-react"

// Group names - Team list
const GROUP_NAMES = [
  "3PL",
  "Alliance Heathcare",
  "Community Retail and Long-Term Care",
  "Corporate Partnerships",
  "Customer Success & Enablement",
  "Finance",
  "GDATS",
  "Global Pharma Services",
  "Health Systems & Government Services",
  "Human Resources",
  "Innomar",
  "Legal and Corporate Affairs",
  "Marketing, Comms & Policy",
  "MSO",
  "MWI Animal Health",
  "Specialty GPO",
  "Specialty Physician Services",
  "Strategic Global Sourcing",
  "Strategy Enablement Team",
  "US Supply Chain",
  "World Courier"
]

// Business processes with descriptions from PDF
const BUSINESS_PROCESSES = [
  {
    id: "benefit-verification",
    title: "Benefit verification",
    includes: "Eligibility checks, benefits review, prior auth submission, payer follow-ups",
  },
  {
    id: "clinical-trial-support",
    title: "Clinical trial support",
    includes: "Clinical trial logistics, comparator sourcing, kitting, labeling, storage, reverse logistics, inventory management",
  },
  {
    id: "customer-onboarding",
    title: "Customer onboarding",
    includes: "Intake forms, data entry, account setup, customer communications",
  },
  {
    id: "customer-support",
    title: "Customer support and service",
    includes: "Case intake, routing, troubleshooting, customer updates",
  },
  {
    id: "equipment-maintenance",
    title: "Equipment maintenance",
    includes: "Monitoring and inspections, failure analysis, work orders",
  },
  {
    id: "knowledge-management",
    title: "Knowledge management",
    includes: "Documentation, version control, tagging, knowledge base updates",
  },
  {
    id: "finance",
    title: "Finance and financial management",
    includes: "Budgeting, forecasting, revenue analysis, financial reporting",
  },
  {
    id: "learning-development",
    title: "Learning and development",
    includes: "Skill assessments, content creation, training delivery, progress tracking",
  },
  {
    id: "mergers-acquisitions",
    title: "Mergers and acquisitions",
    includes: "Due diligence, valuation, contract review, data migration",
  },
  {
    id: "marketing-sales",
    title: "Marketing and sales customization",
    includes: "Segmentation, campaign planning, content creation, performance tracking",
  },
  {
    id: "operations-planning",
    title: "Operations planning and execution",
    includes: "Staffing, capacity planning, resource allocation",
  },
  {
    id: "procurement",
    title: "Procurement",
    includes: "RFPs, vendor selection, contract negotiation, invoice processing",
  },
  {
    id: "product-development",
    title: "Product development",
    includes: "Requirements definition, prototyping, testing, launch planning",
  },
  {
    id: "revenue-lifecycle",
    title: "Revenue lifecycle management",
    includes: "Pricing setup, invoicing, payment processing, collections",
  },
  {
    id: "risk-compliance",
    title: "Risk and compliance management",
    includes: "Risk assessments, policy management, audits, incident tracking",
  },
]

// Thought Leaders Logo component - matching assessment 1
function ThoughtLeadersLogo({ variant = "light", size = "default" }: { variant?: "light" | "dark", size?: "default" | "large" }) {
  const sizeClass = size === "large" ? "h-24 md:h-32" : "h-16 md:h-20"
  const logoSrc = variant === "dark" ? "/thought-leaders-logo-purple.svg" : "/thought-leaders-logo.svg"
  
  return (
    <img 
      src={logoSrc} 
      alt="Thought Leaders 2026" 
      className={`${sizeClass} w-auto`}
    />
  )
}

// Process Card Component - grid card style
function ProcessCard({ 
  process, 
  isSelected, 
  selectionOrder,
  isDisabled,
  onToggle 
}: { 
  process: typeof BUSINESS_PROCESSES[0]
  isSelected: boolean
  selectionOrder: number | null
  isDisabled: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        if (!isDisabled || isSelected) onToggle()
      }}
      disabled={isDisabled && !isSelected}
      className={`relative w-full text-left p-3 pr-3 rounded-2xl transition-all duration-200 h-auto flex flex-col ${
        isSelected 
          ? 'bg-white shadow-lg' 
          : 'bg-white/70 hover:bg-white/80'
      } ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Title */}
      <h3 className="font-normal text-[#461E96] text-xl md:text-2xl leading-[1.1] mb-2 pr-2">
        {process.title}
      </h3>
      
      {/* Includes work like */}
      <div className="pb-6 overflow-hidden pr-2">
        <p className="font-bold text-[#461E96] text-sm md:text-base mb-0.5">Includes work like:</p>
        <p className="text-[#461E96]/70 text-[14px] md:text-[15px] leading-tight">{process.includes}</p>
      </div>

      {/* Selection order badge in bottom-right corner */}
      {isSelected && selectionOrder && (
        <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-[#461E96] flex items-center justify-center">
          <span className="text-white font-bold text-sm">{selectionOrder}</span>
        </div>
      )}
    </motion.button>
  )
}

export default function AIAssessment() {
  const [stage, setStage] = useState<"loading" | "intro" | "groupSelect" | "ranking" | "submitted">("loading")
  const [groupName, setGroupName] = useState("")
  const [groupSearch, setGroupSearch] = useState("")
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingGroup, setExistingGroup] = useState<string | null>(null)
  const groupInputRef = useRef<HTMLInputElement>(null)

  // Filter groups based on search
  const filteredGroups = GROUP_NAMES.filter(group => 
    group.toLowerCase().includes(groupSearch.toLowerCase())
  ).sort((a, b) => a.localeCompare(b))

  // Check for existing session data on load
  useEffect(() => {
    const checkExistingData = async () => {
      try {
        // Check localStorage for sessionId backups
        const storedSessionId = localStorage.getItem("assessment_session_id")
        const storedAiSessionId = localStorage.getItem("ai_assessment_session_id")
        
        let groupFromAssessment1: string | null = null
        let groupFromAiAssessment: string | null = null
        
        // Check if they have a group from assessment 1
        const url = storedSessionId 
          ? `/api/assessment/results?sessionId=${storedSessionId}`
          : "/api/assessment/results"
        const res = await fetch(url, { credentials: "include" })
        const data = await res.json()
        
        if (data.groupName) {
          groupFromAssessment1 = data.groupName
        }
        
        // Check if they already completed this assessment (AI assessment)
        const aiUrl = storedAiSessionId
          ? `/api/ai-assessment/results?sessionId=${storedAiSessionId}`
          : "/api/ai-assessment/results"
        const aiRes = await fetch(aiUrl, { credentials: "include" })
        const aiData = await aiRes.json()
        
        if (aiData.groupName) {
          groupFromAiAssessment = aiData.groupName
        }
        
        // Prefer Assessment 1's group (most recently selected), fall back to AI assessment's group
        const groupToUse = groupFromAssessment1 || groupFromAiAssessment
        if (groupToUse) {
          setExistingGroup(groupToUse)
          setGroupName(groupToUse)
          setGroupSearch(groupToUse)
        }
        
        setStage("groupSelect")
      } catch {
        setStage("groupSelect")
      }
    }
    
    checkExistingData()
  }, [existingGroup])

  const handleStart = () => {
    setStage("groupSelect")
  }

  const handleGroupSelect = (group: string) => {
    setGroupName(group)
    setGroupSearch(group)
    setShowGroupDropdown(false)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleGroupContinue = () => {
    if (groupName) {
      setStage("ranking")
    }
  }

  const handleProcessToggle = (processId: string) => {
    if (selectedProcesses.includes(processId)) {
      setSelectedProcesses(selectedProcesses.filter(p => p !== processId))
    } else if (selectedProcesses.length < 3) {
      setSelectedProcesses([...selectedProcesses, processId])
    }
  }

  const handleSubmit = async () => {
    if (selectedProcesses.length !== 3) return
    
    setIsSubmitting(true)
    try {
      // Convert IDs to titles for storage
      const processTitles = selectedProcesses.map(id => 
        BUSINESS_PROCESSES.find(p => p.id === id)?.title || id
      )
      
      const saveRes = await fetch("/api/ai-assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          topProcesses: processTitles,
          notes,
        }),
      })
      
      // Store sessionId in localStorage as backup
      const saveData = await saveRes.json()
      if (saveData.sessionId) {
        localStorage.setItem("ai_assessment_session_id", saveData.sessionId)
      }
      
      setStage("submitted")
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = async () => {
    try {
      await fetch("/api/ai-assessment/reset", { method: "POST" })
      setSelectedProcesses([])
      setNotes("")
      setStage("groupSelect")
    } catch (error) {
      console.error("Failed to reset:", error)
    }
  }

  return (
    <div 
      className="min-h-[100dvh] relative overflow-hidden"
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
            className="min-h-[100dvh] flex items-center justify-center"
          >
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}

        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
          >
            {/* Header */}
            <header className="p-5 md:p-8">
              <div className="text-white text-sm md:text-base tracking-wider font-light">cencora</div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-5 md:px-8 pb-8">
              <div className="max-w-lg w-full mx-auto">
                <div className="mb-8 md:mb-10">
                  <ThoughtLeadersLogo variant="light" size="large" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-4">
                    If we play our cards right, AI Disruption can be a key accelerant for Cencora, and for all of us working together to reach the goals outlined in our 2030 strategy.
                  </p>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4">
                    To get started, we want you to think about your teams, and the processes that guide your work everyday.
                  </p>
                  <p className="text-[#00DC8C] text-base md:text-lg font-semibold mb-8">
                    We'll spend some time later investigating how we might apply AI to some of these processes, so to get started, please rank the top 3 business processes that could benefit from AI disruption on your team. If you'd like, you can also write a note about why.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  onClick={handleStart}
                  className="group flex items-center justify-center gap-2 w-full bg-white text-[#461E96] px-6 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-[#00DC8C] hover:text-[#461E96] transition-all duration-300 shadow-lg"
                >
                  Submit your three
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
            {/* Header */}
            <header className="p-5 md:p-8">
              <div className="text-white text-sm md:text-base tracking-wider font-light">cencora</div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col px-5 md:px-8 pb-8 pt-8 md:pt-12">
              <div className="max-w-lg w-full mx-auto">
                <div className="mb-16 flex justify-center">
                  <ThoughtLeadersLogo variant="light" size="default" />
                </div>
                
                <div className="mb-10 md:mb-12 flex flex-col items-center text-center">
                  <h2 className="text-white text-4xl md:text-5xl">
                    Accelerating<br />Strategy with AI
                  </h2>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <p className="text-white text-xl md:text-2xl mb-2">
                    {existingGroup ? "Confirm your team name." : "Please select your team name."}
                  </p>
                  <p className="text-white/70 text-base md:text-lg mb-8">
                    {existingGroup ? "We found your team from the previous assessment. You can change it if needed." : "You can find it on your badge."}
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

        {stage === "ranking" && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
          >
            {/* Header */}
            <header className="p-4 md:p-8">
              <div className="text-white text-sm md:text-base tracking-wider font-light">cencora</div>
            </header>

            {/* Main content */}
            <main className="flex-1 px-4 md:px-8 pb-8">
              <div className="max-w-4xl w-full mx-auto">
                {/* Hero headline */}
                <div className="text-center mb-6">
                  <h1 className="text-white text-4xl md:text-5xl font-sans font-normal leading-tight mb-6">
                    Imagining AI<br />disruption at Cencora
                  </h1>
                  <p className="text-white text-xl md:text-2xl leading-snug">
                    <span className="font-bold">Select three</span> business processes<br />where AI tools could drive the<br />most impact for your team
                  </p>
                  <div className="flex flex-col items-center justify-center gap-2 mt-4">
                    <div className={`px-5 py-2 rounded-full text-sm font-bold ${
                      selectedProcesses.length === 3 
                        ? 'bg-[#00DC8C] text-white' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {selectedProcesses.length}/3
                    </div>
                    {selectedProcesses.length === 3 && (
                      <span className="text-[#00DC8C] text-sm font-medium">Ready to submit!</span>
                    )}
                  </div>
                </div>

                {/* Process grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  {BUSINESS_PROCESSES.map((process) => {
                    const isSelected = selectedProcesses.includes(process.id)
                    const selectionOrder = isSelected ? selectedProcesses.indexOf(process.id) + 1 : null
                    const isDisabled = selectedProcesses.length >= 3 && !isSelected
                    
                    return (
                      <ProcessCard
                        key={process.id}
                        process={process}
                        isSelected={isSelected}
                        selectionOrder={selectionOrder}
                        isDisabled={isDisabled}
                        onToggle={() => handleProcessToggle(process.id)}
                      />
                    )
                  })}
                </div>

                {/* Notes field */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    Add a note about why (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share your thoughts on why these processes could benefit from AI..."
                    className="w-full p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00DC8C]/50 focus:border-[#00DC8C] shadow-lg resize-none"
                    rows={3}
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={selectedProcesses.length !== 3 || isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${
                    selectedProcesses.length === 3 && !isSubmitting
                      ? 'bg-white text-[#461E96] hover:bg-[#00DC8C]'
                      : 'bg-white/30 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit your three
                      <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {stage === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col relative z-10"
          >
            {/* Header */}
            <header className="p-5 md:p-8">
              <div className="text-white text-sm md:text-base tracking-wider font-light">cencora</div>
            </header>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-5 max-w-md w-full mx-auto text-center"
            >
              <div className="mb-8 flex justify-center">
                <ThoughtLeadersLogo variant="light" size="default" />
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#00DC8C] flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>

              <h1 className="text-white text-3xl md:text-4xl font-normal mb-6">
                Thank you!
              </h1>
              
              <p className="text-white text-base md:text-lg leading-relaxed">
                Your selections have been submitted. We&apos;ll use this input to guide how we build high-value AI use-cases later this afternoon.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
