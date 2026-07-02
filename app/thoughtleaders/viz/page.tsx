import { ResultsVisualization } from "@/components/results-visualization"

export const metadata = {
  title: "Lorem Ipsum | Your Brand 2026",
  description: "Lorem ipsum dolor sit amet consectetur",
}

export default function VizPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-auto">
      <ResultsVisualization />
    </div>
  )
}
