'use client'

import { useState, useEffect, useRef } from 'react'
import PropertyCard from './PropertyCard'
import { ChevronLeft, ChevronRight } from 'lucide-react' // Ya phir @heroicons se

interface Property {
  id: string
  title: string
  price: number
  priceLabel: string
  image: string
  location: string
  beds: number
  baths: number
  sqft: number
  type: string
  featured: boolean
  video_url?: string | null
}

interface PropertySliderProps {
  title: string
  properties: Property[]
  showCount?: number
}

export default function PropertySlider({ title, properties, showCount = 4}: PropertySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  
  // Agar properties kam hain, toh unhe duplicate karte hain smooth sliding ke liye
  const extendedProperties = [...properties, ...properties.slice(0, showCount)]
  
  // Total slides calculate karte hain
  const totalSlides = Math.ceil(extendedProperties.length / showCount)
  
  // Auto slide effect
  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      handleNext()
    }, 2000) // Har 3 seconds par automatically move hoga
    
    return () => clearInterval(interval)
  }, [currentIndex, isPaused])

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= totalSlides - 1) {
        // Agar last slide par hain, toh smoothly first par wapas aayein
        setTimeout(() => {
          setCurrentIndex(0)
        }, 50)
        return prev + 1
      }
      return prev + 1
    })
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        // Agar first slide par hain, toh last par jayein
        return totalSlides - 1
      }
      return prev - 1
    })
  }

  // Mouse hover par pause/resume
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div className="container-custom">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary hover:bg-primary/5 group"
            aria-label="Previous properties"
          >
            {/* Simple arrow agar icon na chale */}
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-gray-700 group-hover:text-primary font-bold text-lg">←</span>
            </div>
          </button>
          
          <button
            onClick={handleNext}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary hover:bg-primary/5 group"
            aria-label="Next properties"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-gray-700 group-hover:text-primary font-bold text-lg">→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Auto-slide progress indicator */}
       

        {/* Slider Track */}
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / totalSlides)}%)`,
            width: `${totalSlides * 100}%`
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div 
              key={slideIndex}
              className="w-full shrink-0 px-2"
              style={{ width: `${100 / totalSlides}%` }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {extendedProperties
                  .slice(slideIndex * showCount, slideIndex * showCount + showCount)
                  .map((property, idx) => (
                    <div 
                      key={`${property.id}-${slideIndex}-${idx}`}
                      className="transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                    >
                      <PropertyCard property={property} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Overlay for smooth edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white to-transparent" />
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center items-center mt-8 space-x-2">
        {Array.from({ length: Math.min(totalSlides, properties.length / showCount) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex % (properties.length / showCount)
                ? 'bg-primary w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-slide Status */}
      

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .property-enter {
          animation: slideIn 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}