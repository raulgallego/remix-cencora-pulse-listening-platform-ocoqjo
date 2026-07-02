"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Lorem ipsum dolor sit amet, consectetur adipiscing elit
const BUSINESS_PROCESSES = [
  { id: "benefit-verification", title: "Lorem ipsum dolor", includes: "Lorem ipsum, dolor sit amet, consectetur adipiscing, elit follow-ups" },
  { id: "clinical-trial-support", title: "Lorem ipsum support", includes: "Lorem ipsum logistics, comparator sourcing, kitting, labeling, storage, reverse logistics, inventory management" },
  { id: "customer-onboarding", title: "Lorem ipsum onboarding", includes: "Lorem ipsum forms, data entry, account setup, customer communications" },
  { id: "customer-support", title: "Lorem ipsum and service", includes: "Lorem ipsum intake, routing, troubleshooting, customer updates" },
  { id: "equipment-maintenance", title: "Lorem ipsum maintenance", includes: "Lorem ipsum and inspections, failure analysis, work orders" },
  { id: "knowledge-management", title: "Lorem ipsum management", includes: "Lorem ipsum, version control, tagging, knowledge base updates" },
  { id: "finance", title: "Lorem ipsum management", includes: "Lorem ipsum, forecasting, revenue analysis, financial reporting" },
  { id: "learning-development", title: "Lorem ipsum development", includes: "Lorem ipsum, content creation, training delivery, progress tracking" },
  { id: "mergers-acquisitions", title: "Lorem ipsum acquisitions", includes: "Lorem ipsum, valuation, contract review, data migration" },
  { id: "marketing-sales", title: "Lorem ipsum customization", includes: "Lorem ipsum, campaign planning, content creation, performance tracking" },
  { id: "operations-planning", title: "Lorem ipsum and execution", includes: "Lorem ipsum, capacity planning, resource allocation" },
  { id: "procurement", title: "Lorem ipsum", includes: "Lorem ipsum, vendor selection, contract negotiation, invoice processing" },
  { id: "product-development", title: "Lorem ipsum development", includes: "Lorem ipsum definition, prototyping, testing, launch planning" },
  { id: "revenue-lifecycle", title: "Lorem ipsum management", includes: "Lorem ipsum setup, invoicing, payment processing, collections" },
  { id: "risk-compliance", title: "Lorem ipsum management", includes: "Lorem ipsum, policy management, audits, incident tracking" },
]

interface AIAggregatedData {
  totalResponses: number
  processCounts: Record<string, number>
  groups: string[]
}

export function AIResultsVisualization() {
  const [data, setData] = useState<AIAggregatedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Lorem ipsum dolor sit amet
  const fetchData = useCallback(async () => {
    try {
      const url = selectedGroup === "all" 
        ? "/api/ai-assessment/aggregated"
        : `/api/ai-assessment/aggregated?group=${encodeURIComponent(selectedGroup)}`
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Lorem ipsum dolor:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedGroup])

  // Lorem ipsum dolor sit amet
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Lorem ipsum dolor sit amet
  const getTop5Processes = (): string[] => {
    if (!data?.processCounts) return []
    return Object.entries(data.processCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title]) => title)
  }

  if (isLoading) {
    return (
      <div 
        className="w-full min-h-[100dvh] md:w-[2816px] md:h-[1232px] md:min-h-0 flex items-center justify-center"
        style={{
          backgroundImage: "url('/assessment-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-white text-2xl md:text-4xl font-bold">Lorem ipsum dolor...</div>
      </div>
    )
  }

  const top5 = getTop5Processes()

  return (
    <div 
      className="w-full min-h-[100dvh] md:w-[2816px] md:h-[1232px] md:min-h-0 relative overflow-hidden"
      style={{
        backgroundImage: "url('/assessment-background.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Lorem ipsum - dolor sit amet */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center z-10 px-4 pt-4 md:pt-8"
      >
        <h1 className="text-white text-2xl md:text-6xl font-bold">
          Lorem Ipsum Dolor
        </h1>
        <p className="text-white/70 text-sm md:text-2xl mt-1 md:mt-2">
          Lorem ipsum selected for dolor impact
        </p>
      </motion.div>

      {/* Lorem ipsum dropdown - below title */}
      <div className="flex justify-center mt-3 md:mt-4 px-4 z-20 relative">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-[#00DC8C] rounded-lg px-4 py-2 text-white text-sm md:text-base transition-colors"
          >
            <span>{selectedGroup === "all" ? "Lorem Teams" : selectedGroup}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 md:w-64 bg-white rounded-lg shadow-xl overflow-hidden z-30 max-h-[300px] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setSelectedGroup("all")
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm md:text-base hover:bg-gray-100 transition-colors ${
                    selectedGroup === "all" ? "bg-[#461E96]/10 text-[#461E96] font-semibold" : "text-gray-700"
                  }`}
                >
                  Lorem Teams
                </button>
                {data?.groups?.map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedGroup(group)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm md:text-base hover:bg-gray-100 transition-colors ${
                      selectedGroup === group ? "bg-[#461E96]/10 text-[#461E96] font-semibold" : "text-gray-700"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lorem ipsum grid - sorted by dolor count (highest first) */}
      <div className="px-4 md:px-16 pb-20 md:pb-24 mt-4 md:mt-6 overflow-auto md:overflow-visible" style={{ height: "calc(100dvh - 180px)", maxHeight: "calc(100dvh - 180px)" }}>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 md:gap-6 h-auto md:h-full pt-3 md:pt-0">
          {[...BUSINESS_PROCESSES]
            .sort((a, b) => {
              const countA = data?.processCounts?.[a.title] || 0
              const countB = data?.processCounts?.[b.title] || 0
              return countB - countA // Lorem ipsum descending by dolor count
            })
            .map((process, index) => {
            const count = data?.processCounts?.[process.title] || 0
            // Lorem ipsum as top 5 if index < 5 (since array is sorted by count)
            const isTop5 = index < 5 && count > 0
            
            return (
              <motion.div
                key={process.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
                className={`rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between relative h-[220px] md:h-auto md:aspect-square ${
                  isTop5 ? "bg-white" : "bg-white/10 border border-white/30"
                }`}
                style={{
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Lorem ipsum and description at top */}
                <div className="text-left pb-10">
                  <span className={`text-lg md:text-xl font-normal leading-tight block mb-3 line-clamp-2 ${
                    isTop5 ? "text-[#461E96]" : "text-white"
                  }`}>
                    {process.title}
                  </span>
                  <span className={`text-sm md:text-base leading-snug block line-clamp-4 ${
                    isTop5 ? "text-[#461E96]/70" : "text-white/70"
                  }`}>
                    {process.includes}
                  </span>
                </div>
                {/* Lorem ipsum at bottom right */}
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                  <span className={`text-lg md:text-3xl font-bold ${
                    isTop5 ? "text-[#461E96]/80" : "text-white/80"
                  }`}>
                    {count}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Lorem ipsum count */}
      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-16 text-white/60 text-sm md:text-lg z-20">
        {data?.totalResponses || 0} lorem ipsum
        {selectedGroup !== "all" && ` from ${selectedGroup}`}
      </div>

      {/* Lorem ipsum to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
