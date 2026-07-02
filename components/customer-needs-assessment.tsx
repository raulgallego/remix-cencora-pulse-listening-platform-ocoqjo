"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Lock, Upload, Trash2, RefreshCw, X, Image as ImageIcon, Plus, Download } from "lucide-react"

// Simple password protection - change this value to update the password
const ACCESS_PASSWORD = "TL2026SYP"

// Categories and subcategories
const CATEGORIES = ["Resilience", "Power", "Value", "Innovation", "Intelligence"] as const
const SUBCATEGORIES = ["Providers", "Pharmacies", "Pharma Manufacturers", "Health Systems"] as const

type Category = typeof CATEGORIES[number]
type Subcategory = typeof SUBCATEGORIES[number]

type Values = {
  [key in Lowercase<Category>]: {
    providers: number
    pharmacies: number
    pharmaManufacturers: number
    healthSystems: number
  }
}

// Category colors matching the chart
const CATEGORY_COLORS: Record<Category, string> = {
  Value: "#00DC8C",      // Green
  Power: "#00B4E6",      // Blue
  Intelligence: "#FF8B6A", // Coral
  Innovation: "#FF4FA2",  // Pink
  Resilience: "#FFB627",  // Orange
}

// Slide image interface
interface SlideImage {
  id: number
  slide_number: number
  image_url: string | null
  images: string[] | null
  title: string
  subtitle: string
  updated_at: string
}

// Collage slot component for image upload
function CollageSlot({
  slideIndex,
  slideNumber,
  position,
  imageUrl,
  isUploading,
  onUpload,
  onDelete,
  fileInputRefs,
  aspectClass = "aspect-video",
}: {
  slideIndex: number
  slideNumber: number
  position: number
  imageUrl?: string
  isUploading: boolean
  onUpload: (file: File) => void
  onDelete: () => void
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  aspectClass?: string
}) {
  const refKey = `${slideIndex}-${position}`
  
  return (
    <div className="h-full">
      <div
        className={`${aspectClass} h-full rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all relative group ${
          imageUrl
            ? "bg-gray-200"
            : "bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#461E96]"
        }`}
        onClick={() => fileInputRefs.current[refKey]?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mb-1" />
            <span className="text-xs">Uploading...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Slide ${slideNumber} image ${position + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay with delete button */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">{position + 1}</span>
          </div>
        )}
      </div>
      <input
        ref={(el) => { fileInputRefs.current[refKey] = el }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

// Admin tabs
type AdminTab = "customer-needs" | "slide-images" | "positioning" | "reset-data"

// ThoughtLeadersLogo component (same as in other assessments)
function ThoughtLeadersLogo({ variant = "dark", size = "default" }: { variant?: "dark" | "light"; size?: "default" | "large" }) {
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

export default function CustomerNeedsAssessment() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [stage, setStage] = useState<"loading" | "input" | "submitted">("loading")
  const [values, setValues] = useState<Values>({
    resilience: { providers: 0, pharmacies: 0, pharmaManufacturers: 0, healthSystems: 0 },
    power: { providers: 0, pharmacies: 0, pharmaManufacturers: 0, healthSystems: 0 },
    value: { providers: 0, pharmacies: 0, pharmaManufacturers: 0, healthSystems: 0 },
    innovation: { providers: 0, pharmacies: 0, pharmaManufacturers: 0, healthSystems: 0 },
    intelligence: { providers: 0, pharmacies: 0, pharmaManufacturers: 0, healthSystems: 0 },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [groupName, setGroupName] = useState("")
  
  // Admin tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("customer-needs")
  
  // Slide images state
  const [slides, setSlides] = useState<SlideImage[]>([])
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null)
  const [editingSlide, setEditingSlide] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSubtitle, setEditSubtitle] = useState("")
  // Use a Map-like object for refs: key is "slideIndex-position"
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  
  // Reset data state
  const [resettingTable, setResettingTable] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [exportingTable, setExportingTable] = useState<string | null>(null)
  
  // Positioning state
  const [positioningValues, setPositioningValues] = useState({
    at_risk: 0,
    competitive: 0,
    differentiated: 0,
    market_leading: 0,
  })
  const [isLoadingPositioning, setIsLoadingPositioning] = useState(false)
  const [isSavingPositioning, setIsSavingPositioning] = useState(false)
  const [positioningSaved, setPositioningSaved] = useState(false)

  // Check for stored authentication
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("customer_needs_auth")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === ACCESS_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("customer_needs_auth", "true")
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  // Check for existing data and group name from other assessments
  useEffect(() => {
    if (!isAuthenticated) return
    
    const checkExistingData = async () => {
      try {
        // Check for existing group from assessment 1
        const storedSessionId = localStorage.getItem("assessment_session_id")
        const url = storedSessionId 
          ? `/api/assessment/results?sessionId=${storedSessionId}`
          : "/api/assessment/results"
        const res = await fetch(url, { credentials: "include" })
        const data = await res.json()
        
        if (data.groupName) {
          setGroupName(data.groupName)
        }

        // Check for existing customer needs data
        const customerRes = await fetch("/api/customer-needs/results", { credentials: "include" })
        const customerData = await customerRes.json()
        
        if (customerData.hasResults && customerData.values) {
          setValues(customerData.values)
          if (customerData.groupName) {
            setGroupName(customerData.groupName)
          }
        }

        setStage("input")
      } catch {
        setStage("input")
      }
    }
    
    checkExistingData()
  }, [isAuthenticated])

  // Fetch slide images data
  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/slide-images")
      const data = await res.json()
      if (Array.isArray(data)) {
        setSlides(data)
      }
    } catch (error) {
      console.error("Failed to fetch slides:", error)
    }
  }

  // Fetch positioning data
  const fetchPositioning = async () => {
    setIsLoadingPositioning(true)
    try {
      const res = await fetch("/api/positioning")
      const data = await res.json()
      if (data && !data.error) {
        setPositioningValues({
          at_risk: data.at_risk || 0,
          competitive: data.competitive || 0,
          differentiated: data.differentiated || 0,
          market_leading: data.market_leading || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch positioning:", error)
    } finally {
      setIsLoadingPositioning(false)
    }
  }
  
  // Fetch slides when authenticated
  useEffect(() => {
  if (isAuthenticated) {
  fetchSlides()
  fetchPositioning()
    }
  }, [isAuthenticated])

  // Track which position is uploading (slideNumber-position format)
  const [uploadingPosition, setUploadingPosition] = useState<string | null>(null)
  
  // Handle file upload with position for collage
  const handleFileUpload = async (slideNumber: number, file: File, position?: number) => {
    setUploadingSlide(slideNumber)
    if (position !== undefined) {
      setUploadingPosition(`${slideNumber}-${position}`)
    }
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("slideNumber", slideNumber.toString())
    if (position !== undefined) {
      formData.append("position", position.toString())
    }
    
    try {
      const res = await fetch("/api/slide-images/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        await fetchSlides()
      } else {
        const error = await res.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
    } finally {
      setUploadingSlide(null)
      setUploadingPosition(null)
    }
  }
  
  // Handle image delete with position
  const handleDeleteImage = async (slideNumber: number, position?: number) => {
    if (!confirm("Are you sure you want to remove this image?")) return
    
    try {
      const res = await fetch("/api/slide-images/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideNumber, position }),
      })
      
      if (res.ok) {
        await fetchSlides()
      } else {
        const error = await res.json()
        alert(`Delete failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Delete failed")
    }
  }

  // Handle title/subtitle update
  const handleSaveTitle = async (slideNumber: number) => {
    try {
      const res = await fetch("/api/slide-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide_number: slideNumber,
          title: editTitle,
          subtitle: editSubtitle,
        }),
      })

      if (res.ok) {
        await fetchSlides()
        setEditingSlide(null)
      } else {
        const error = await res.json()
        alert(`Update failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Update failed")
    }
  }

  // Start editing a slide
  const startEditing = (slide: SlideImage) => {
    setEditingSlide(slide.slide_number)
    setEditTitle(slide.title || "")
    setEditSubtitle(slide.subtitle || "")
  }

  const handleValueChange = (category: Category, subcategory: Subcategory, value: string) => {
    const numValue = parseInt(value) || 0
    const categoryKey = category.toLowerCase() as Lowercase<Category>
    const subcategoryKey = subcategory === "Pharma Manufacturers" 
      ? "pharmaManufacturers" 
      : subcategory === "Health Systems" 
        ? "healthSystems" 
        : subcategory.toLowerCase() as "providers" | "pharmacies"
    
    setValues(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [subcategoryKey]: numValue,
      },
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    try {
      const res = await fetch("/api/customer-needs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          values,
        }),
      })
      
      const data = await res.json()
      if (data.sessionId) {
        localStorage.setItem("customer_needs_session_id", data.sessionId)
      }
      
      // Show success message but stay on the form so values remain visible
      setSubmitSuccess(true)
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if any values have been entered
  const hasValues = Object.values(values).some(cat => 
    Object.values(cat).some(v => v > 0)
  )

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00B4E6] via-[#461E96] to-[#2E3A8C]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Protected Page</h2>
            <p className="text-white/70 text-center mt-2">Enter the password to access this assessment</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  setPasswordError(false)
                }}
                placeholder="Enter password"
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border-2 ${
                  passwordError ? 'border-red-400' : 'border-white/30'
                } text-white placeholder-white/50 focus:outline-none focus:border-white/60 transition-colors`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-300 text-sm mt-2">Incorrect password. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-white text-[#461E96] font-bold rounded-lg hover:bg-white/90 transition-colors"
            >
              Access Assessment
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00B4E6] via-[#461E96] to-[#2E3A8C]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00B4E6] via-[#461E96] to-[#2E3A8C]">
      <AnimatePresence mode="wait">
        {stage === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4 py-8"
          >
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#00DC8C] via-[#FF4FA2] to-[#FFB627]" />
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <ThoughtLeadersLogo variant="dark" />
                </div>
                
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("customer-needs")}
                    className={`px-4 py-2 text-sm md:text-base font-medium transition-colors relative ${
                      activeTab === "customer-needs"
                        ? "text-[#461E96]"
                        : "text-gray-500 hover:text-[#461E96]"
                    }`}
                  >
                    Customer Needs
                    {activeTab === "customer-needs" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#461E96]"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("slide-images")}
                    className={`px-4 py-2 text-sm md:text-base font-medium transition-colors relative ${
                      activeTab === "slide-images"
                        ? "text-[#461E96]"
                        : "text-gray-500 hover:text-[#461E96]"
                    }`}
                  >
                    Slide Images
                    {activeTab === "slide-images" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#461E96]"
                      />
                    )}
  </button>
  <button
    onClick={() => setActiveTab("positioning")}
    className={`px-4 py-2 text-sm md:text-base font-medium transition-colors relative ${
      activeTab === "positioning"
        ? "text-[#461E96]"
        : "text-gray-500 hover:text-[#461E96]"
    }`}
  >
    Positioning
    {activeTab === "positioning" && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#461E96]"
      />
    )}
  </button>
  <button
  onClick={() => setActiveTab("reset-data")}
  className={`px-4 py-2 text-sm md:text-base font-medium transition-colors relative ${
  activeTab === "reset-data"
  ? "text-[#461E96]"
  : "text-gray-500 hover:text-[#461E96]"
                    }`}
                  >
                    Reset Data
                    {activeTab === "reset-data" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#461E96]"
                      />
                    )}
                  </button>
                </div>
                
                {/* Customer Needs Tab */}
                {activeTab === "customer-needs" && (
                  <>
                <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-2">
                  What Our Customers Need
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter values for each category and customer segment.
                </p>

                {/* Input Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-[#461E96] font-bold text-sm md:text-base">Category</th>
                        {SUBCATEGORIES.map(sub => (
                          <th key={sub} className="p-2 text-[#461E96] font-medium text-xs md:text-sm text-center min-w-[100px]">
                            {sub}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CATEGORIES.map((category, idx) => (
                        <tr key={category} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[category] }}
                              />
                              <span className="text-[#461E96] font-medium text-sm md:text-base">
                                {category}
                              </span>
                            </div>
                          </td>
                          {SUBCATEGORIES.map(sub => {
                            const categoryKey = category.toLowerCase() as Lowercase<Category>
                            const subKey = sub === "Pharma Manufacturers" 
                              ? "pharmaManufacturers" 
                              : sub === "Health Systems" 
                                ? "healthSystems" 
                                : sub.toLowerCase() as "providers" | "pharmacies"
                            
                            return (
                              <td key={sub} className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={values[categoryKey][subKey] || ""}
                                  onChange={(e) => handleValueChange(category, sub, e.target.value)}
                                  placeholder="0"
                                  className="w-full max-w-[80px] mx-auto px-3 py-2 border border-gray-300 rounded-lg text-center text-[#461E96] font-medium focus:outline-none focus:ring-2 focus:ring-[#461E96] focus:border-transparent"
                                />
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex flex-col items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!hasValues || isSubmitting}
                    className={`px-8 py-3 rounded-full font-bold text-white transition-all duration-300 ${
                      hasValues && !isSubmitting
                        ? "bg-gradient-to-r from-[#461E96] to-[#2E3A8C] hover:shadow-lg hover:scale-105"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Values"}
                  </button>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[#00DC8C] font-medium"
                    >
                      <Check className="w-5 h-5" />
                      <span>Values submitted successfully!</span>
                    </motion.div>
                  )}
                </div>
                  </>
                )}
                
                {/* Slide Images Tab */}
                {activeTab === "slide-images" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-1">
                          Slide Images
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Manage images for visualization slides. Changes appear within 60 seconds.
                        </p>
                      </div>
                      <button
                        onClick={fetchSlides}
                        className="flex items-center gap-2 bg-[#461E96]/10 hover:bg-[#461E96]/20 text-[#461E96] px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    {/* Slides List - Custom display order: Slide 3, Slide 1, Slide 2 */}
                    <div className="space-y-6">
                      {[...slides]
                        .sort((a, b) => {
                          const displayOrder: Record<number, number> = { 3: 0, 1: 1, 2: 2 }
                          return (displayOrder[a.slide_number] ?? a.slide_number) - (displayOrder[b.slide_number] ?? b.slide_number)
                        })
                        .map((slide, slideIndex) => {
                        // Get images array, fallback to image_url for backwards compatibility
                        const images: string[] = Array.isArray(slide.images) 
                          ? slide.images 
                          : (slide.image_url ? [slide.image_url] : [])
                        
                        // Map slide numbers to display labels
                        const slideDisplayLabels: Record<number, number> = { 1: 6, 2: 9 }
                        const displayLabel = slideDisplayLabels[slide.slide_number] ?? slide.slide_number
                        
                        return (
                          <div
                            key={slide.id}
                            className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                          >
                            {/* Slide Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#461E96] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                  Slide {displayLabel}
                                </span>
                                {editingSlide === slide.slide_number ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-[#461E96] focus:outline-none focus:ring-2 focus:ring-[#461E96] w-40"
                                      placeholder="Title..."
                                    />
                                    <input
                                      type="text"
                                      value={editSubtitle}
                                      onChange={(e) => setEditSubtitle(e.target.value)}
                                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-[#461E96] focus:outline-none focus:ring-2 focus:ring-[#461E96] w-40"
                                      placeholder="Subtitle..."
                                    />
                                    <button
                                      onClick={() => handleSaveTitle(slide.slide_number)}
                                      className="bg-green-100 hover:bg-green-200 text-green-700 p-1.5 rounded-lg"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setEditingSlide(null)}
                                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-lg"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-[#461E96] font-bold text-sm">
                                      {slide.title || <span className="text-gray-400 italic font-normal">No title</span>}
                                    </span>
                                    <button
                                      onClick={() => startEditing(slide)}
                                      className="text-[#461E96] hover:underline text-xs"
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Collage Grid - 5 positions */}
                            <div className="grid grid-cols-3 gap-2" style={{ gridTemplateRows: "1fr 1fr" }}>
                              {/* Position 0: Large left (spans 2 rows) */}
                              <div className="row-span-2">
                                <CollageSlot
                                  slideIndex={slideIndex}
                                  slideNumber={slide.slide_number}
                                  position={0}
                                  imageUrl={images[0]}
                                  isUploading={uploadingPosition === `${slide.slide_number}-0`}
                                  onUpload={(file) => handleFileUpload(slide.slide_number, file, 0)}
                                  onDelete={() => handleDeleteImage(slide.slide_number, 0)}
                                  fileInputRefs={fileInputRefs}
                                  aspectClass="aspect-square"
                                />
                              </div>
                              
                              {/* Position 1: Large middle (spans 2 rows) */}
                              <div className="row-span-2">
                                <CollageSlot
                                  slideIndex={slideIndex}
                                  slideNumber={slide.slide_number}
                                  position={1}
                                  imageUrl={images[1]}
                                  isUploading={uploadingPosition === `${slide.slide_number}-1`}
                                  onUpload={(file) => handleFileUpload(slide.slide_number, file, 1)}
                                  onDelete={() => handleDeleteImage(slide.slide_number, 1)}
                                  fileInputRefs={fileInputRefs}
                                  aspectClass="aspect-square"
                                />
                              </div>
                              
                              {/* Position 2: Top right */}
                              <CollageSlot
                                slideIndex={slideIndex}
                                slideNumber={slide.slide_number}
                                position={2}
                                imageUrl={images[2]}
                                isUploading={uploadingPosition === `${slide.slide_number}-2`}
                                onUpload={(file) => handleFileUpload(slide.slide_number, file, 2)}
                                onDelete={() => handleDeleteImage(slide.slide_number, 2)}
                                fileInputRefs={fileInputRefs}
                                aspectClass="aspect-video"
                              />
                              
                              {/* Position 3: Middle right */}
                              <CollageSlot
                                slideIndex={slideIndex}
                                slideNumber={slide.slide_number}
                                position={3}
                                imageUrl={images[3]}
                                isUploading={uploadingPosition === `${slide.slide_number}-3`}
                                onUpload={(file) => handleFileUpload(slide.slide_number, file, 3)}
                                onDelete={() => handleDeleteImage(slide.slide_number, 3)}
                                fileInputRefs={fileInputRefs}
                                aspectClass="aspect-video"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                      <a
                        href="/thoughtleaders/viz"
                        target="_blank"
                        className="text-[#461E96] hover:underline text-sm"
                      >
                        Open Visualization →
                      </a>
  </div>
  </>
  )}
  
  {/* Positioning Tab */}
  {activeTab === "positioning" && (
    <>
      <div className="mb-6">
        <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-1">
          Market Positioning
        </h2>
        <p className="text-gray-600 text-sm">
          Enter the number of sticker votes for each positioning category (Slide 9).
        </p>
      </div>

      {positioningSaved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Positioning data saved successfully!
        </div>
      )}

      {isLoadingPositioning ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#461E96]" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* At Risk */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-[#461E96] font-bold mb-2">
                At risk of falling behind
              </label>
              <input
                type="number"
                min="0"
                value={positioningValues.at_risk}
                onChange={(e) => setPositioningValues(prev => ({ ...prev, at_risk: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
              />
            </div>

            {/* Competitive */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-[#461E96] font-bold mb-2">
                Competitive but undifferentiated
              </label>
              <input
                type="number"
                min="0"
                value={positioningValues.competitive}
                onChange={(e) => setPositioningValues(prev => ({ ...prev, competitive: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
              />
            </div>

            {/* Differentiated */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-[#461E96] font-bold mb-2">
                Clearly differentiated
              </label>
              <input
                type="number"
                min="0"
                value={positioningValues.differentiated}
                onChange={(e) => setPositioningValues(prev => ({ ...prev, differentiated: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
              />
            </div>

            {/* Leading */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-[#461E96] font-bold mb-2">
                Leading in the market
              </label>
              <input
                type="number"
                min="0"
                value={positioningValues.market_leading}
                onChange={(e) => setPositioningValues(prev => ({ ...prev, market_leading: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#461E96]"
              />
            </div>
          </div>

          <button
            onClick={async () => {
              setIsSavingPositioning(true)
              setPositioningSaved(false)
              try {
                const res = await fetch("/api/positioning", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(positioningValues),
                })
                if (res.ok) {
                  setPositioningSaved(true)
                  setTimeout(() => setPositioningSaved(false), 3000)
                } else {
                  alert("Failed to save positioning data")
                }
              } catch {
                alert("Failed to save positioning data")
              } finally {
                setIsSavingPositioning(false)
              }
            }}
            disabled={isSavingPositioning}
            className={`w-full py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
              isSavingPositioning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#461E96] hover:bg-[#3a1a7a]"
            }`}
          >
            {isSavingPositioning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Positioning Data"
            )}
          </button>

          {/* Preview link */}
          <div className="text-center">
            <a
              href="/thoughtleaders/viz"
              target="_blank"
              className="text-[#461E96] hover:underline text-sm"
            >
              Open Visualization (Slide 9) →
            </a>
          </div>
        </div>
      )}
    </>
  )}
  
  {/* Reset Data Tab */}
  {activeTab === "reset-data" && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-1">
                        Reset Database Results
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Clear all results from individual database tables. This action cannot be undone.
                      </p>
                    </div>

                    {resetSuccess && (
                      <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        {resetSuccess}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Assessment Results (Mindset) */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[#461E96] font-bold">Assessment Results (Mindset)</h3>
                            <p className="text-gray-500 text-sm">Active Learning & Leading Standards survey responses</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Are you sure you want to reset all Assessment Results? This cannot be undone.")) return
                              setResettingTable("assessment_results")
                              setResetSuccess(null)
                              try {
                                const res = await fetch("/api/reset-table", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ table: "assessment_results" }),
                                })
                                if (res.ok) {
                                  setResetSuccess("Assessment Results have been reset successfully.")
                                } else {
                                  alert("Failed to reset table")
                                }
                              } catch {
                                alert("Failed to reset table")
                              } finally {
                                setResettingTable(null)
                              }
                            }}
                            disabled={resettingTable !== null}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              resettingTable === "assessment_results"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            {resettingTable === "assessment_results" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Reset
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* AI Assessment Results */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[#461E96] font-bold">AI Assessment Results</h3>
                            <p className="text-gray-500 text-sm">Business process AI disruption survey responses</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Are you sure you want to reset all AI Assessment Results? This cannot be undone.")) return
                              setResettingTable("ai_assessment_results")
                              setResetSuccess(null)
                              try {
                                const res = await fetch("/api/reset-table", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ table: "ai_assessment_results" }),
                                })
                                if (res.ok) {
                                  setResetSuccess("AI Assessment Results have been reset successfully.")
                                } else {
                                  alert("Failed to reset table")
                                }
                              } catch {
                                alert("Failed to reset table")
                              } finally {
                                setResettingTable(null)
                              }
                            }}
                            disabled={resettingTable !== null}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              resettingTable === "ai_assessment_results"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            {resettingTable === "ai_assessment_results" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Reset
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Customer Needs Results */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[#461E96] font-bold">Customer Needs Results</h3>
                            <p className="text-gray-500 text-sm">Customer needs category values</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Are you sure you want to reset all Customer Needs Results? This cannot be undone.")) return
                              setResettingTable("customer_needs_results")
                              setResetSuccess(null)
                              try {
                                const res = await fetch("/api/reset-table", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ table: "customer_needs_results" }),
                                })
                                if (res.ok) {
                                  setResetSuccess("Customer Needs Results have been reset successfully.")
                                } else {
                                  alert("Failed to reset table")
                                }
                              } catch {
                                alert("Failed to reset table")
                              } finally {
                                setResettingTable(null)
                              }
                            }}
                            disabled={resettingTable !== null}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              resettingTable === "customer_needs_results"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            {resettingTable === "customer_needs_results" ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Reset
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-sm">
                        <strong>Warning:</strong> Resetting a table will permanently delete all data. Make sure you have exported any data you need before resetting.
                      </p>
                    </div>

                    {/* Export Data Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="mb-6">
                        <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-1">
                          Export Data
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Download assessment data as CSV files.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Export Assessment 1 */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-[#461E96] font-bold">Assessment 1 (Mindset)</h3>
                              <p className="text-gray-500 text-sm">Export Active Learning & Leading Standards survey responses</p>
                            </div>
                            <button
                              onClick={async () => {
                                setExportingTable("assessment_results")
                                try {
                                  const res = await fetch("/api/export/assessment-results")
                                  if (res.ok) {
                                    const blob = await res.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement("a")
                                    a.href = url
                                    a.download = `assessment-1-results-${new Date().toISOString().split("T")[0]}.csv`
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                  } else {
                                    alert("Failed to export data")
                                  }
                                } catch {
                                  alert("Failed to export data")
                                } finally {
                                  setExportingTable(null)
                                }
                              }}
                              disabled={exportingTable !== null}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                exportingTable === "assessment_results"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-[#461E96] hover:bg-[#3a1878] text-white"
                              }`}
                            >
                              {exportingTable === "assessment_results" ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Export CSV
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Export Assessment 2 */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-[#461E96] font-bold">Assessment 2 (AI Disruption)</h3>
                              <p className="text-gray-500 text-sm">Export business process AI disruption survey responses</p>
                            </div>
                            <button
                              onClick={async () => {
                                setExportingTable("ai_assessment_results")
                                try {
                                  const res = await fetch("/api/export/ai-assessment-results")
                                  if (res.ok) {
                                    const blob = await res.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement("a")
                                    a.href = url
                                    a.download = `assessment-2-ai-results-${new Date().toISOString().split("T")[0]}.csv`
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                  } else {
                                    alert("Failed to export data")
                                  }
                                } catch {
                                  alert("Failed to export data")
                                } finally {
                                  setExportingTable(null)
                                }
                              }}
                              disabled={exportingTable !== null}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                exportingTable === "ai_assessment_results"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-[#461E96] hover:bg-[#3a1878] text-white"
                              }`}
                            >
                              {exportingTable === "ai_assessment_results" ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Export CSV
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seed Test Data Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="mb-6">
                        <h2 className="text-[#461E96] text-xl md:text-2xl font-bold mb-1">
                          Seed Test Data
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Generate simulated participant data for testing visualizations.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-xl p-4 bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[#461E96] font-bold">Generate 250 Simulated Participants</h3>
                            <p className="text-gray-500 text-sm">Creates random responses for Assessment 1 (Mindset) and Assessment 2 (AI Disruption)</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("This will add 250 simulated participants to each assessment. Continue?")) return
                              setIsSeeding(true)
                              setResetSuccess(null)
                              try {
                                const res = await fetch("/api/seed-data", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ count: 250 }),
                                })
                                if (res.ok) {
                                  setResetSuccess("Successfully seeded 250 participants for each assessment!")
                                } else {
                                  alert("Failed to seed data")
                                }
                              } catch {
                                alert("Failed to seed data")
                              } finally {
                                setIsSeeding(false)
                              }
                            }}
                            disabled={isSeeding || resettingTable !== null}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                              isSeeding
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                            }`}
                          >
                            {isSeeding ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Seeding...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Seed Data
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>Note:</strong> Seeding will add new records without deleting existing data. To start fresh, reset the tables first.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {stage === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-md w-full"
            >
              <div className="mb-6 flex justify-center">
                <ThoughtLeadersLogo variant="light" size="large" />
              </div>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#00DC8C] flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
                  Thank you!
                </h1>
                
                <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                  Your customer needs values have been submitted successfully.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
