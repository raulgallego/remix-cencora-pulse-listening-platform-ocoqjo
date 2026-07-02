"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as d3Force from "d3-force"

// D3 Force simulation node type
interface ForceNode extends d3Force.SimulationNodeDatum {
  id: string
  radius: number
  targetX: number
  targetY: number
}

// D3 Force-based physics simulation - matching reference implementation
function useCirclePhysics(
  circles: { id: string; x: number; y: number; size: number }[],
  containerWidth: number,
  containerHeight: number
) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; scale: number }>>({})
  const simulationRef = useRef<d3Force.Simulation<ForceNode, undefined> | null>(null)
  const nodesRef = useRef<ForceNode[]>([])
  const tickRef = useRef(0)
  const animationIdRef = useRef<number | null>(null)
  
  // Create a stable key for circle data to detect actual changes
  const circlesKey = useMemo(() => 
    circles.map(c => `${c.id}:${c.size}:${c.x}:${c.y}`).join('|'),
    [circles]
  )
  
  // Initialize or update simulation when circles change
  useEffect(() => {
    if (circles.length === 0 || containerWidth === 0) return
    
    const centerX = containerWidth * 0.5
    const centerY = containerHeight * 0.5
    
    // Convert percentage positions to pixel positions
    // Preserve existing positions but update radii for smooth size transitions
    const nodes: ForceNode[] = circles.map(c => {
      const existing = nodesRef.current.find(n => n.id === c.id)
      return {
        id: c.id,
        x: existing?.x ?? (c.x / 100) * containerWidth,
        y: existing?.y ?? (c.y / 100) * containerHeight,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        radius: c.size / 2, // Updated radius for new vote counts
        targetX: (c.x / 100) * containerWidth,
        targetY: (c.y / 100) * containerHeight,
      }
    })
    nodesRef.current = nodes
    
    // Stop existing simulation and animation
    if (simulationRef.current) {
      simulationRef.current.stop()
    }
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
    
    // Create D3 force simulation matching reference:
    // .force("charge", d3.forceManyBody().strength(-10))
    // .force("collide", d3.forceCollide().radius(d => d.radius).iterations(2).strength(1))
    // .force("center", d3.forceCenter(...))
    const simulation = d3Force.forceSimulation<ForceNode>(nodes)
      .force("charge", d3Force.forceManyBody<ForceNode>()
        .strength(-10) // Match reference
      )
      .force("collide", d3Force.forceCollide<ForceNode>()
        .radius(d => d.radius + 8)
        .strength(1)
        .iterations(2)
      )
      .force("center", d3Force.forceCenter(centerX, centerY))
      .force("x", d3Force.forceX<ForceNode>()
        .x(d => d.targetX)
        .strength(0.02) // Match reference
      )
      .force("y", d3Force.forceY<ForceNode>()
        .y(d => d.targetY)
        .strength(0.02) // Match reference
      )
      .velocityDecay(0.3)
      
    simulationRef.current = simulation
    
    // Keep simulation constantly active: alpha(1).alphaTarget(1).restart()
    simulation.alpha(1).alphaTarget(1).restart()
    
    // Animation loop
    const animate = () => {
      tickRef.current += 1
      const time = tickRef.current / 60 // Seconds
      
      // Update target positions with smooth floating motion
      nodes.forEach((node, i) => {
        const baseCircle = circles.find(c => c.id === node.id)
        if (baseCircle) {
          // Smooth sinusoidal floating with different phases per node
          const floatX = Math.sin(time * 0.4 + i * 1.2) * 30
          const floatY = Math.cos(time * 0.35 + i * 0.9) * 25
          node.targetX = (baseCircle.x / 100) * containerWidth + floatX
          node.targetY = (baseCircle.y / 100) * containerHeight + floatY
        }
        
        // Keep within bounds
        const padding = node.radius + 30
        if (node.x !== undefined) {
          node.x = Math.max(padding, Math.min(containerWidth - padding, node.x))
        }
        if (node.y !== undefined) {
          const topPadding = node.radius + containerHeight * 0.15
          const bottomPadding = node.radius + containerHeight * 0.1
          node.y = Math.max(topPadding, Math.min(containerHeight - bottomPadding, node.y))
        }
      })
      
      // Re-initialize forces with updated targets
      const collideForce = simulation.force("collide") as d3Force.ForceCollide<ForceNode>
      if (collideForce) collideForce.initialize(nodes)
      
      // Update React state with positions and breathing scale
      // Reference: scale={1 + Math.sin(tick) * 5/radius - 5/radius}
      const newPositions: Record<string, { x: number; y: number; scale: number }> = {}
      nodes.forEach((node, i) => {
        if (node.x !== undefined && node.y !== undefined) {
          // Breathing effect: smaller circles pulse more, larger pulse less
          const breathTick = tickRef.current / 30 + i
          const breathAmount = 5 / node.radius
          const scale = 1 + Math.sin(breathTick) * breathAmount - breathAmount
          
          newPositions[node.id] = {
            x: (node.x / containerWidth) * 100,
            y: (node.y / containerHeight) * 100,
            scale: Math.max(0.92, Math.min(1.08, scale)),
          }
        }
      })
      setPositions(newPositions)
      
      animationIdRef.current = requestAnimationFrame(animate)
    }
    
    animationIdRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      simulation.stop()
    }
  }, [circlesKey, containerWidth, containerHeight])
  
  return positions
}

// The 6 mindsets/tags - using exact tag names from assessment 1, ordered for visual display
const MINDSETS = [
  { id: "Learn in the arena", label: "Learn in the\narena", shortLabel: "MINDSET 1" },
  { id: "Elevate people to win", label: "Elevate people to win", shortLabel: "MINDSET 2" },
  { id: "See around corners", label: "See around\ncorners", shortLabel: "MINDSET 3" },
  { id: "Think beyond your role", label: "Think beyond your role", shortLabel: "MINDSET 4" },
  { id: "Own the outcome", label: "Own the\noutcome", shortLabel: "MINDSET 5" },
  { id: "Match kindness with rigor", label: "Match kindness with rigor", shortLabel: "MINDSET 6" },
]

// Circle positions for the layout - adjusted to prevent overlap and stay within bounds
// Positions map to MINDSETS array order
const CIRCLE_POSITIONS = [
  { x: 18, y: 22 }, // Learn in the arena - top left
  { x: 55, y: 28 }, // Elevate people to win - center top
  { x: 85, y: 18 }, // See around corners - top right
  { x: 12, y: 68 }, // Think beyond your role - bottom left
  { x: 45, y: 65 }, // Own the outcome - center bottom
  { x: 78, y: 72 }, // Match kindness with rigor - bottom right
]

// 15 Business processes from assessment-2 with descriptions
const BUSINESS_PROCESSES = [
  { id: "benefit-verification", title: "Benefit verification", includes: "Eligibility checks, benefits review, prior auth submission, payer follow-ups" },
  { id: "clinical-trial-support", title: "Clinical trial support", includes: "Clinical trial logistics, comparator sourcing, kitting, labeling, storage, reverse logistics, inventory management" },
  { id: "customer-onboarding", title: "Customer onboarding", includes: "Intake forms, data entry, account setup, customer communications" },
  { id: "customer-support", title: "Customer support and service", includes: "Case intake, routing, troubleshooting, customer updates" },
  { id: "equipment-maintenance", title: "Equipment maintenance", includes: "Monitoring and inspections, failure analysis, work orders" },
  { id: "knowledge-management", title: "Knowledge management", includes: "Documentation, version control, tagging, knowledge base updates" },
  { id: "finance", title: "Finance and financial management", includes: "Budgeting, forecasting, revenue analysis, financial reporting" },
  { id: "learning-development", title: "Learning and development", includes: "Skill assessments, content creation, training delivery, progress tracking" },
  { id: "mergers-acquisitions", title: "Mergers and acquisitions", includes: "Due diligence, valuation, contract review, data migration" },
  { id: "marketing-sales", title: "Marketing and sales customization", includes: "Segmentation, campaign planning, content creation, performance tracking" },
  { id: "operations-planning", title: "Operations planning and execution", includes: "Staffing, capacity planning, resource allocation" },
  { id: "procurement", title: "Procurement", includes: "RFPs, vendor selection, contract negotiation, invoice processing" },
  { id: "product-development", title: "Product development", includes: "Requirements definition, prototyping, testing, launch planning" },
  { id: "revenue-lifecycle", title: "Revenue lifecycle management", includes: "Pricing setup, invoicing, payment processing, collections" },
  { id: "risk-compliance", title: "Risk and compliance management", includes: "Risk assessments, policy management, audits, incident tracking" },
]

interface AggregatedData {
  totalResponses: number
  tagCounts: Record<string, number>
  strengthsCounts: Record<string, number>
  growthAreasCounts: Record<string, number>
}

interface AIAggregatedData {
  totalResponses: number
  processCounts: Record<string, number>
}

interface SlideImage {
  id: number
  slide_number: number
  image_url: string | null
  images: string[] | null
  title: string
  subtitle: string
  updated_at: string
}

// Floating circle component - position and scale controlled by physics simulation
function FloatingCircle({
  mindset,
  position,
  size,
  isHighlighted,
  delay,
  count,
  scale = 1,
}: {
  mindset: typeof MINDSETS[0]
  position: { x: number; y: number }
  size: number
  isHighlighted: boolean
  delay: number
  count: number
  scale?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Staggered entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${isVisible ? scale : 0})`,
        opacity: isVisible ? 1 : 0,
        transition: isVisible ? 'transform 0.05s linear, opacity 0.6s ease-out' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out',
      }}
    >
      <div
        className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center p-6 transition-colors duration-700 ${
          isHighlighted
            ? "bg-white shadow-2xl"
            : "bg-white/10 border border-white/30"
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          {isHighlighted ? (
            <>
              <span 
                className="text-2xl md:text-3xl lg:text-4xl font-cencora-gilroy font-bold leading-tight text-center whitespace-pre-line"
                style={{
                  background: "linear-gradient(90deg, #0073BE 0%, #461E96 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {mindset.label}
              </span>
              <span 
                className="text-lg md:text-2xl font-cencora-gilroy font-bold mt-2"
                style={{
                  background: "linear-gradient(90deg, #0073BE 0%, #461E96 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {count}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl md:text-3xl lg:text-4xl font-cencora-gilroy font-bold leading-tight text-center text-white whitespace-pre-line">
                {mindset.label}
              </span>
              <span className="text-lg md:text-2xl font-cencora-gilroy font-bold mt-2 text-white">
                {count}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Slide 9 Positioning Component - 4 circles with white gradient heatmap based on votes
function Slide9Positioning({ positioningData }: { 
  positioningData: { at_risk: number; competitive: number; differentiated: number; market_leading: number } | null 
}) {
  const columns = [
    { key: "at_risk", label: "At risk of\nfalling behind" },
    { key: "competitive", label: "Competitive but\nundifferentiated" },
    { key: "differentiated", label: "Clearly\ndifferentiated" },
    { key: "market_leading", label: "Leading in\nthe market" },
  ]
  
  // Calculate max and min votes for normalization
  const { maxVotes, minVotes } = useMemo(() => {
    if (!positioningData) return { maxVotes: 1, minVotes: 0 }
    const values = [
      positioningData.at_risk,
      positioningData.competitive,
      positioningData.differentiated,
      positioningData.market_leading,
    ]
    return {
      maxVotes: Math.max(...values, 1),
      minVotes: Math.min(...values, 0)
    }
  }, [positioningData])

  // Generate white gradient based on vote intensity (0-1)
  const getWhiteGradientStyle = (intensity: number) => {
    // White gradient: more votes = more opaque/brighter white
    const baseOpacity = 0.15 + intensity * 0.45 // Range from 0.15 to 0.6
    const innerOpacity = 0.3 + intensity * 0.5 // Range from 0.3 to 0.8
    
    return {
      background: `radial-gradient(circle at 30% 30%, 
        rgba(255, 255, 255, ${innerOpacity}) 0%, 
        rgba(255, 255, 255, ${baseOpacity + 0.1}) 30%, 
        rgba(255, 255, 255, ${baseOpacity}) 60%, 
        rgba(255, 255, 255, ${baseOpacity - 0.05}) 100%)`
    }
  }

  // Calculate circle size based on votes (bigger circles for more votes)
  const getCircleSize = (count: number) => {
    const intensity = maxVotes > minVotes ? (count - minVotes) / (maxVotes - minVotes) : 0.5
    // Base size + scaling factor (range from 280px to 420px on large screens)
    const minSize = 280
    const maxSize = 420
    const size = minSize + (maxSize - minSize) * intensity
    return size
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 pt-24 md:pt-32">
      {/* 4 Circles with White Gradient Heatmap - Full Width with gaps */}
      <div className="flex justify-between items-end w-full gap-4 md:gap-6 lg:gap-8">
        {columns.map((column, colIdx) => {
          const count = positioningData?.[column.key as keyof typeof positioningData] || 0
          const intensity = maxVotes > minVotes ? (count - minVotes) / (maxVotes - minVotes) : 0.5
          const circleSize = getCircleSize(count)

          return (
            <motion.div
              key={column.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + colIdx * 0.15, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* White Gradient Circle - Size varies based on votes */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.3 + colIdx * 0.15, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200
                }}
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: `${circleSize}px`,
                  height: `${circleSize}px`,
                  ...getWhiteGradientStyle(intensity),
                  boxShadow: `0 0 ${20 + intensity * 30}px ${5 + intensity * 15}px rgba(255, 255, 255, ${0.1 + intensity * 0.2})`,
                }}
              >
                {/* Inner highlight effect */}
                <div 
                  className="absolute inset-3 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, 
                      rgba(255,255,255,${0.4 + intensity * 0.3}) 0%, 
                      transparent 50%)`
                  }}
                />
                
                {/* Vote count in center */}
                <span 
                  className="text-white font-bold drop-shadow-lg z-10"
                  style={{
                    fontSize: `${Math.max(32, circleSize * 0.28)}px`
                  }}
                >
                  {count}
                </span>
              </motion.div>
              
              {/* Column Label below circle */}
              <div className="text-white text-center text-xl md:text-2xl lg:text-3xl font-bold whitespace-pre-line mt-4 md:mt-6 h-16 md:h-20 flex items-center justify-center">
                {column.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export function ResultsVisualization() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [data, setData] = useState<AggregatedData | null>(null)
  const [aiData, setAIData] = useState<AIAggregatedData | null>(null)
  const [slideImages, setSlideImages] = useState<SlideImage[]>([])
  const [positioningData, setPositioningData] = useState<{
    at_risk: number
    competitive: number
    differentiated: number
    market_leading: number
  } | null>(null)
  const [customerNeedsData, setCustomerNeedsData] = useState<{
    totalResponses: number
    aggregated: {
      providers: { value: number; power: number; intelligence: number; innovation: number; resilience: number }
      pharmacies: { value: number; power: number; intelligence: number; innovation: number; resilience: number }
      pharmaManufacturers: { value: number; power: number; intelligence: number; innovation: number; resilience: number }
      healthSystems: { value: number; power: number; intelligence: number; innovation: number; resilience: number }
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [containerSize, setContainerSize] = useState({ width: 2816, height: 1232 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track container size for physics calculations
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  // Prepare circle data for physics simulation (must be before any conditional returns)
  const circleData = useMemo(() => {
    if (!data || !data.tagCounts) {
      // Return default positions when data not loaded
      return MINDSETS.map((mindset, index) => ({
        id: mindset.id,
        x: CIRCLE_POSITIONS[index].x,
        y: CIRCLE_POSITIONS[index].y,
        size: 300,
      }))
    }
    
    // Sort mindsets by vote count to determine positioning
    const sortedMindsets = [...MINDSETS]
      .map((m, i) => ({ ...m, originalIndex: i, count: data.tagCounts[m.id] || 0 }))
      .sort((a, b) => b.count - a.count)
    
    // Position mapping based on rank - top 3 (white) clustered in center, rest around them
    const positionsByRank = [
      { x: 50, y: 50 },  // Rank 0 (largest/top) - center
      { x: 36, y: 38 },  // Rank 1 (2nd) - upper-left of center
      { x: 64, y: 38 },  // Rank 2 (3rd) - upper-right of center
      { x: 20, y: 52 },  // Rank 3 - far left (peripheral)
      { x: 80, y: 52 },  // Rank 4 - far right (peripheral)
      { x: 50, y: 22 },  // Rank 5 (smallest) - top center (peripheral)
    ]
    
    return MINDSETS.map((mindset, index) => {
      const rank = sortedMindsets.findIndex(m => m.id === mindset.id)
      const position = positionsByRank[rank] || CIRCLE_POSITIONS[index]
      
      // Calculate size
      const count = data.tagCounts[mindset.id] || 0
      const allCounts = Object.values(data.tagCounts) as number[]
      const maxCount = Math.max(...allCounts, 1)
      const minCount = Math.min(...allCounts, 0)
      const minSize = 180
      const maxSize = 450
      let size = (minSize + maxSize) / 2
      if (maxCount !== minCount) {
        const ratio = (count - minCount) / (maxCount - minCount)
        const amplifiedRatio = Math.pow(ratio, 2.5)
        size = Math.round(minSize + amplifiedRatio * (maxSize - minSize))
      }
      
      return {
        id: mindset.id,
        x: position.x,
        y: position.y,
        size,
      }
    })
  }, [data])
  
  // Stringify circle data to ensure proper change detection for physics updates
  const circleDataKey = useMemo(() => 
    circleData.map(c => `${c.id}:${c.size}`).join(','), 
    [circleData]
  )
  
  // Use physics simulation for circle positions - will update when sizes change
  const physicsPositions = useCirclePhysics(circleData, containerSize.width, containerSize.height * 0.8)

  // Fetch aggregated data with 60 second auto-refresh
  useEffect(() => {
async function fetchData() {
  try {
  // Fetch all data including slide images and positioning
  const [res1, res2, res3, res4, res5] = await Promise.all([
  fetch("/api/assessment/aggregated"),
  fetch("/api/ai-assessment/aggregated"),
  fetch("/api/customer-needs/aggregate"),
  fetch("/api/slide-images"),
  fetch("/api/positioning"),
  ])
  const [json1, json2, json3, json4, json5] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json(), res5.json()])
  setData(json1)
  setAIData(json2)
  setCustomerNeedsData(json3)
  if (Array.isArray(json4)) {
    setSlideImages(json4)
  }
  setPositioningData(json5)
  } catch (error) {
  console.error("Failed to fetch data:", error)
  } finally {
  setIsLoading(false)
  }
  }
    
    // Initial fetch
    fetchData()
    
    // Set up 60 second interval for refreshing data
    const interval = setInterval(fetchData, 60000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // Keyboard navigation (11 slides now)
  const TOTAL_SLIDES = 11
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault()
      setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1))
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault()
      setCurrentSlide((prev) => Math.max(prev - 1, 0))
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Calculate which mindsets to highlight based on data
  const getHighlightedMindsets = (slideIndex: number): string[] => {
    if (!data || !data.tagCounts) return []

    // Sort mindsets by vote count
    const sortedByVotes = MINDSETS
      .map(m => ({ id: m.id, count: data.tagCounts[m.id] || 0 }))
      .sort((a, b) => b.count - a.count)

    if (slideIndex === 4) {
      // Slide 4: Where we're strong - highlight top 3 with MOST votes (white)
      return sortedByVotes.slice(0, 3).map(m => m.id)
    }
    // Other slides don't show mindset circles
    return []
  }

  // Calculate circle sizes based on aggregated tag counts - amplified for visual impact
  const getCircleSize = (mindsetId: string): number => {
    if (!data || !data.tagCounts) return 350

    const count = data.tagCounts[mindsetId] || 0
    const allCounts = Object.values(data.tagCounts) as number[]
    const maxCount = Math.max(...allCounts, 1)
    const minCount = Math.min(...allCounts, 0)
    
    // Define min and max circle sizes - much wider range for visible differences
    const minSize = 180
    const maxSize = 450
    
    // Calculate proportional size
    if (maxCount === minCount) return (minSize + maxSize) / 2
    
    // Use power function to amplify differences significantly
    const ratio = (count - minCount) / (maxCount - minCount)
    const amplifiedRatio = Math.pow(ratio, 2.5) // Strong amplification
    return Math.round(minSize + amplifiedRatio * (maxSize - minSize))
  }
  
  // Get position for a specific mindset - organic bubble cluster layout
  const getDynamicPosition = (mindsetId: string, index: number): { x: number; y: number } => {
    if (!data || !data.tagCounts) return CIRCLE_POSITIONS[index]
    
    // Sort mindsets by vote count to determine positioning
    const sortedMindsets = [...MINDSETS]
      .map((m, i) => ({ ...m, originalIndex: i, count: data.tagCounts[m.id] || 0 }))
      .sort((a, b) => b.count - a.count)
    
    // Find rank of this mindset (0 = highest votes)
    const rank = sortedMindsets.findIndex(m => m.id === mindsetId)
    
    // Organic bubble cluster - larger circles in center, smaller ones spread around
    // Positions widely spaced to prevent any overlap even with largest circles
    const positionsByRank = [
      { x: 38, y: 50 },  // Rank 0 (largest) - left of center
      { x: 62, y: 50 },  // Rank 1 - right of center
      { x: 20, y: 32 },  // Rank 2 - upper left (moved left)
      { x: 80, y: 32 },  // Rank 3 - upper right (moved right)
      { x: 20, y: 68 },  // Rank 4 - lower left (moved left and down)
      { x: 80, y: 68 },  // Rank 5 (smallest) - lower right (moved right)
    ]
    
    return positionsByRank[rank] || CIRCLE_POSITIONS[index]
  }

// Default slide data (used when DB data not loaded)
const defaultSlideData = [
  { title: "Key Takeaways\nFrom the Morning", subtitle: "" }, // Slide 0: Opening slide
  { title: "Agenda", subtitle: "" }, // Slide 1: Agenda slide (static image)
  { title: "The Next Chapter of Active Learning\nand Active Leading", subtitle: "" }, // Slide 2: Image collage
  { title: "Our Active Learning and\nActive Leading Standards", subtitle: "" }, // Slide 3: Static mindset circles
  { title: "Which standards do we\nlean towards most?", subtitle: "" }, // Slide 4: Floating circles
  { title: "Accelerating Strategy with AI", subtitle: "" }, // Slide 5: Image slide (DB slide 1)
  { title: "Business processes with high\npotential for AI disruption", subtitle: "" }, // Slide 6: Static business processes
  { title: "Where do we see the most\nopportunity for AI disruption?", subtitle: "" }, // Slide 7: Top 5 AI
  { title: "The Pharmaceutical\nValue Chain", subtitle: "" }, // Slide 8: Image slide (DB slide 2)
  { title: "Which customers are most\nimpacted by these disruptions?", subtitle: "" }, // Slide 9: Customer needs
  { title: "How well positioned are we to help\ncustomers navigate disruption?", subtitle: "" }, // Slide 10: Positioning
]

  // Get slide data - use database values for image slides if available
  // Admin Slide 1 (DB 1) → Viz slide 5 "Our AI Acceleration"
  // Admin Slide 2 (DB 2) → Viz slide 8 "The Pharmaceutical Value Chain"
  // Admin Slide 3 (DB 3) → Viz slide 2 "The Next Chapter of AL/AL"
  const getSlideData = (slideIndex: number) => {
    // Helper to get images array from db slide
    const getImages = (dbSlide: { images?: string[] | null; image_url?: string | null }) => {
      if (dbSlide.images && Array.isArray(dbSlide.images) && dbSlide.images.length > 0) {
        return dbSlide.images
      }
      if (dbSlide.image_url) {
        return [dbSlide.image_url]
      }
      return []
    }
    
    // Slide 2 - map to DB slide_number 3
    if (slideIndex === 2) {
      const dbSlide = slideImages.find(s => s.slide_number === 3)
      if (dbSlide) {
        return {
          title: dbSlide.title || defaultSlideData[slideIndex].title,
          subtitle: dbSlide.subtitle || defaultSlideData[slideIndex].subtitle,
          imageUrl: dbSlide.image_url,
          images: getImages(dbSlide),
        }
      }
    }
    // Slide 5 - map to DB slide_number 1
    if (slideIndex === 5) {
      const dbSlide = slideImages.find(s => s.slide_number === 1)
      if (dbSlide) {
        return {
          title: dbSlide.title || defaultSlideData[slideIndex].title,
          subtitle: dbSlide.subtitle || defaultSlideData[slideIndex].subtitle,
          imageUrl: dbSlide.image_url,
          images: getImages(dbSlide),
        }
      }
    }
    // Slide 8 - map to DB slide_number 2
    if (slideIndex === 8) {
      const dbSlide = slideImages.find(s => s.slide_number === 2)
      if (dbSlide) {
        return {
          title: dbSlide.title || defaultSlideData[slideIndex].title,
          subtitle: dbSlide.subtitle || defaultSlideData[slideIndex].subtitle,
          imageUrl: dbSlide.image_url,
          images: getImages(dbSlide),
        }
      }
    }
    return { ...defaultSlideData[slideIndex], imageUrl: null, images: [] }
  }

const slideData = getSlideData(currentSlide)

  // Get top 5 processes for AI slide
  const getTop5Processes = (): string[] => {
    if (!aiData?.processCounts) return []
    return Object.entries(aiData.processCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title]) => title)
  }

  if (isLoading) {
    return (
      <div 
        className="w-full min-h-screen md:w-[2816px] md:h-[1232px] md:min-h-0 flex items-center justify-center"
        style={{
          backgroundColor: "#2E1A8C",
          backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/slidesbackground-MBslOc1xkmIz0QJyURACknttlRGvJt.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-white text-2xl md:text-4xl font-bold">Loading results...</div>
      </div>
    )
  }

  const highlightedMindsets = getHighlightedMindsets(currentSlide)

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-screen md:w-[2816px] md:h-[1232px] md:min-h-0 relative overflow-hidden"
      style={{
        backgroundColor: "#2E1A8C",
        backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/slidesbackground-MBslOc1xkmIz0QJyURACknttlRGvJt.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >


      {/* Response count - show only on slides 4 and 7 (mindset results and AI processes) */}
      {(currentSlide === 4 || currentSlide === 7) && (
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-12 text-white/60 text-sm md:text-lg z-20">
            {currentSlide === 7
              ? `${aiData?.totalResponses || 0} responses`
              : `${data?.totalResponses || 0} responses`
            }
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full relative"
        >
        {/* Slide 0: Full image background */}
        {currentSlide === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <img
              src="/images/slide-0-key-takeaways.svg"
              alt="Key takeaways from the morning"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : currentSlide === 1 ? (
          /* Slide 1: Agenda - Full image */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <img
              src="/images/slide-agenda.png"
              alt="Agenda"
              className="w-full h-full object-contain"
            />
          </motion.div>
        ) : currentSlide === 2 || currentSlide === 5 || currentSlide === 8 ? (
          /* Slides 2, 5 & 8: No title - title is part of the collage */
          null
        ) : (
          /* Title for other slides */
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-8 md:top-16 left-4 md:left-12 right-0 text-left z-10 px-4"
          >
            <h1 className="text-white text-4xl md:text-[90px] font-bold leading-[1.1] whitespace-pre-line">
              {slideData.title}
            </h1>
            {slideData.subtitle && (
              <p className="text-white text-4xl md:text-[90px] font-bold leading-[1.1] mt-1 md:mt-2">
                {slideData.subtitle}
              </p>
            )}
          </motion.div>
        )}

          {/* Slide 2: Special collage with title SVG in top-left */}
          {currentSlide === 2 && (
            <div className="absolute inset-0 flex items-center justify-center pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-10 lg:px-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full h-[85%] md:h-[88%]"
              >
                {/* Collage Grid Layout with title SVG */}
                <div 
                  className="grid gap-2 md:gap-3 h-full" 
                  style={{ 
                    gridTemplateColumns: "1.2fr 1.6fr 1fr",
                    gridTemplateRows: "0.85fr 1fr" 
                  }}
                >
                  {/* Position 0: Title SVG - top left */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden">
                    <img
                      src="/images/slide-2-title.svg"
                      alt="The Next Chapter of Active Leading and Active Learning"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                  
                  {/* Position 1: Large middle (spans 2 rows) */}
                  <div className="row-span-2 rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[0] && (
                      <img
                        src={slideData.images[0]}
                        alt={`${slideData.title} image 1`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 2: Top right */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[1] && (
                      <img
                        src={slideData.images[1]}
                        alt={`${slideData.title} image 2`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 3: Bottom left */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[2] && (
                      <img
                        src={slideData.images[2]}
                        alt={`${slideData.title} image 3`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 4: Bottom right */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[3] && (
                      <img
                        src={slideData.images[3]}
                        alt={`${slideData.title} image 4`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Slide 5: Special collage with title SVG in top-right */}
          {currentSlide === 5 && (
            <div className="absolute inset-0 flex items-center justify-center pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-10 lg:px-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full h-full"
              >
                {/* Collage Grid Layout with title SVG in top-right */}
                <div 
                  className="grid gap-2 md:gap-3 h-full" 
                  style={{ 
                    gridTemplateColumns: "1.6fr 1.6fr 1.2fr",
                    gridTemplateRows: "minmax(0, 0.9fr) minmax(0, 1fr) minmax(0, 1fr)" 
                  }}
                >
                  {/* Position 0: Large left (spans 3 rows) */}
                  <div className="row-span-3 rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[0] && (
                      <img
                        src={slideData.images[0]}
                        alt={`${slideData.title} image 1`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 1: Large middle (spans 3 rows) */}
                  <div className="row-span-3 rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[1] && (
                      <img
                        src={slideData.images[1]}
                        alt={`${slideData.title} image 2`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 2: Title SVG - top right */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden flex items-center">
                    <img
                      src="/images/slide-5-title.svg"
                      alt="Accelerating Strategy with AI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Position 3: Middle right image */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[2] && (
                      <img
                        src={slideData.images[2]}
                        alt={`${slideData.title} image 3`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 4: Bottom right image */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[3] && (
                      <img
                        src={slideData.images[3]}
                        alt={`${slideData.title} image 4`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Slide 8: Special collage with title SVG in bottom-left */}
          {currentSlide === 8 && (
            <div className="absolute inset-0 flex items-center justify-center pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-10 lg:px-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full h-full"
              >
                {/* Collage Grid Layout with title SVG in bottom-left */}
                <div 
                  className="grid gap-2 md:gap-3 h-full" 
                  style={{ 
                    gridTemplateColumns: "1.2fr 1.6fr 1fr",
                    gridTemplateRows: "minmax(0, 2.2fr) minmax(0, 1fr)" 
                  }}
                >
                  {/* Position 0: Top left - image (larger) */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[0] && (
                      <img
                        src={slideData.images[0]}
                        alt={`${slideData.title} image 1`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 1: Large middle (spans 2 rows) */}
                  <div className="row-span-2 rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[1] && (
                      <img
                        src={slideData.images[1]}
                        alt={`${slideData.title} image 2`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 2: Top right - image (larger) */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[2] && (
                      <img
                        src={slideData.images[2]}
                        alt={`${slideData.title} image 3`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Position 3: Title SVG - bottom left */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden flex items-end">
                    <img
                      src="/images/slide-8-title.svg"
                      alt="The Pharmaceutical Value Chain"
                      className="w-full h-full object-cover object-left-bottom"
                    />
                  </div>
                  
                  {/* Position 4: Bottom right - image */}
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-white/10">
                    {slideData.images && slideData.images[3] && (
                      <img
                        src={slideData.images[3]}
                        alt={`${slideData.title} image 4`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Slide 4: Floating circles for mindsets with physics collision */}
          {currentSlide === 4 && (
            <div className="absolute inset-0" style={{ top: "12%", bottom: "8%" }}>
              {MINDSETS.map((mindset, index) => {
                // Use physics position and scale if available
                const physicsData = physicsPositions[mindset.id]
                const circleInfo = circleData.find(c => c.id === mindset.id)
                const fallbackPos = circleInfo ? { x: circleInfo.x, y: circleInfo.y } : CIRCLE_POSITIONS[index]
                const position = physicsData ? { x: physicsData.x, y: physicsData.y } : fallbackPos
                const scale = physicsData?.scale || 1
                const size = circleInfo?.size || 300
                const isHighlighted = highlightedMindsets.includes(mindset.id)
                const count = data?.tagCounts?.[mindset.id] || 0

                return (
                  <FloatingCircle
                    key={mindset.id}
                    mindset={mindset}
                    position={position}
                    size={size}
                    isHighlighted={isHighlighted}
                    delay={index * 0.15}
                    count={count}
                    scale={scale}
                  />
                )
              })}
            </div>
          )}

          {/* Slide 6: Static business processes grid (no vote counts) */}
          {currentSlide === 6 && (
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-16 pt-56 md:pt-64 pb-10 md:pb-16">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-5 w-full max-w-[2400px]">
                {BUSINESS_PROCESSES.map((process, index) => {
                  // Card colors gradient similar to the reference image
                  const cardColors = [
                    "rgba(0, 180, 230, 0.25)",
                    "rgba(40, 150, 210, 0.25)",
                    "rgba(60, 130, 200, 0.25)",
                    "rgba(80, 110, 180, 0.25)",
                    "rgba(100, 90, 170, 0.25)",
                    "rgba(110, 80, 160, 0.25)",
                    "rgba(120, 75, 155, 0.25)",
                    "rgba(130, 70, 150, 0.25)",
                    "rgba(140, 65, 145, 0.25)",
                    "rgba(150, 60, 140, 0.25)",
                    "rgba(155, 58, 138, 0.25)",
                    "rgba(160, 55, 135, 0.25)",
                    "rgba(165, 52, 132, 0.25)",
                    "rgba(170, 50, 130, 0.25)",
                    "rgba(175, 48, 128, 0.25)",
                  ]
                  
                  return (
                    <motion.div
                      key={process.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03, duration: 0.4 }}
                      className="rounded-xl md:rounded-2xl p-4 md:p-8 flex flex-col border border-white/20 min-h-[140px] md:min-h-[240px]"
                      style={{
                        backgroundColor: cardColors[index % cardColors.length],
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span className="text-white text-lg md:text-3xl lg:text-4xl font-bold leading-tight line-clamp-2">
                        {process.title}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Slide 7: Top 5 AI processes - horizontal row */}
          {currentSlide === 7 && (
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-16">
              <div className="flex flex-row gap-4 md:gap-8 w-full max-w-[2400px]">
                {[...BUSINESS_PROCESSES]
                  .sort((a, b) => {
                    const countA = aiData?.processCounts?.[a.title] || 0
                    const countB = aiData?.processCounts?.[b.title] || 0
                    return countB - countA // Sort descending by vote count
                  })
                  .slice(0, 5) // Only top 5
                  .map((process, index) => {
                  const count = aiData?.processCounts?.[process.title] || 0
                  
                  // Card colors gradient from cyan/blue (left) to purple (right)
                  const cardColors = [
                    "rgba(0, 180, 230, 0.4)", // Bright cyan-blue
                    "rgba(60, 130, 200, 0.4)", // Blue
                    "rgba(90, 100, 180, 0.4)", // Blue-purple
                    "rgba(110, 80, 160, 0.4)", // Purple-blue
                    "rgba(130, 70, 150, 0.4)", // Purple
                  ]
                  
                  return (
                    <motion.div
                      key={process.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-1 aspect-square rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col justify-between relative border border-white/60"
                      style={{
                        backgroundColor: cardColors[index],
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {/* Title at top */}
                      <div className="text-left">
                        <span className="text-white text-xl md:text-4xl lg:text-5xl font-bold leading-tight block line-clamp-3">
                          {process.title}
                        </span>
                      </div>
                      {/* Count at bottom right */}
                      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
                        <span className="text-white/80 text-xl md:text-5xl font-bold">
                          {count}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Slide 3: Static mindset circles (no vote counts) */}
          {currentSlide === 3 && (
            <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 lg:px-14">
              <div className="flex flex-row gap-2 md:gap-4 lg:gap-5 justify-between w-full">
                {MINDSETS.map((mindset, index) => (
                  <motion.div
                    key={mindset.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 aspect-square max-w-[420px] rounded-full bg-white flex flex-col items-center justify-center text-center p-4 md:p-8 shadow-xl"
                  >
                    <span 
                      className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-cencora-gilroy font-bold leading-tight whitespace-pre-line text-center"
                      style={{
                        background: "linear-gradient(90deg, #0073BE 0%, #461E96 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {mindset.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 9: Customer Needs - Customer Segment Cards with Disruption Bar Charts */}
          {currentSlide === 9 && (
            <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 lg:px-14 pt-44 md:pt-52 pb-8 md:pb-12">
              {/* 4 Customer Segment Cards */}
              <div className="flex gap-3 md:gap-4 lg:gap-5 w-full h-[70%] md:h-[68%]">
                {(() => {
                  const customerSegments = [
                    { key: "pharmaManufacturers", label: "Pharma\nManufacturers" },
                    { key: "healthSystems", label: "Health\nSystems" },
                    { key: "providers", label: "Providers" },
                    { key: "pharmacies", label: "Pharmacies" },
                  ]
                  
                  const disruptionCategories = [
                    { key: "resilience", label: "Resilience", barColor: "#FFA400" },
                    { key: "power", label: "Power", barColor: "#00B4E6" },
                    { key: "value", label: "Value", barColor: "#40BA8D" },
                    { key: "innovation", label: "Innovation", barColor: "#E1058C" },
                    { key: "intelligence", label: "Intelligence", barColor: "#F5846C" },
                  ]

                  // Calculate global max value across ALL segments and categories for proportional bars
                  const globalMaxValue = Math.max(
                    ...customerSegments.flatMap(segment => {
                      const segData = customerNeedsData?.aggregated?.[segment.key as keyof typeof customerNeedsData.aggregated]
                      return disruptionCategories.map(cat => Number(segData?.[cat.key as keyof typeof segData]) || 0)
                    }),
                    1
                  )

                  return customerSegments.map((segment, segIdx) => {
                    // Get values for each disruption category for this customer segment
                    const segmentData = customerNeedsData?.aggregated?.[segment.key as keyof typeof customerNeedsData.aggregated]
                    const categoryValues = disruptionCategories.map(cat => 
                      Number(segmentData?.[cat.key as keyof typeof segmentData]) || 0
                    )

                    return (
                      <motion.div
                        key={segment.key}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + segIdx * 0.1 }}
                        className="flex-1 bg-white/10 rounded-2xl p-4 md:p-5 lg:p-6 flex flex-col"
                      >
                        {/* Customer Segment Title - fixed height for consistent bar alignment */}
                        <div className="h-[80px] md:h-[100px] lg:h-[120px] flex items-center justify-center mb-4 md:mb-6">
                          <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center whitespace-pre-line leading-tight">
                            {segment.label}
                          </h3>
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="flex items-end justify-center gap-1 md:gap-2 w-full flex-1">
                          {disruptionCategories.map((cat, catIdx) => {
                            const value = categoryValues[catIdx]
                            const heightPercent = globalMaxValue > 0 ? (value / globalMaxValue) * 100 : 0
                            
                            return (
                              <div key={cat.key} className="flex flex-col items-center flex-1 h-full">
                                {/* Bar Container */}
                                <div className="flex-1 w-full flex flex-col items-center justify-end">
                                  {/* Value above bar */}
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 + segIdx * 0.1 + catIdx * 0.05, duration: 0.3 }}
                                    className="text-white font-bold text-2xl md:text-3xl lg:text-4xl mb-1"
                                  >
                                    {value}
                                  </motion.span>
                                  <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: 0.4 + segIdx * 0.1 + catIdx * 0.05, duration: 0.4 }}
                                    className="w-full max-w-[80px] rounded-t-md"
                                    style={{
                                      backgroundColor: cat.barColor,
                                      height: `${Math.max(heightPercent, 2)}%`,
                                      transformOrigin: "bottom",
                                    }}
                                  />
                                </div>
                                {/* Category Label */}
                                <span className="text-white font-medium text-base md:text-lg lg:text-xl text-center mt-2 leading-tight">
                                  {cat.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )
                  })
                })()}
              </div>
            </div>
          )}

          {/* Slide 10: Positioning - 4 Columns with White Gradient Circles */}
          {currentSlide === 10 && (
            <Slide9Positioning positioningData={positioningData} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Instructions overlay (fades after 5 seconds) - hidden on mobile */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 5, duration: 1 }}
        className="hidden md:block absolute bottom-8 left-12 text-white/40 text-lg pointer-events-none"
      >
        Press arrow keys or space to navigate
      </motion.div>
    </div>
  )
}
