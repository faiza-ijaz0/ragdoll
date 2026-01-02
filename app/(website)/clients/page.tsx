'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon, SparklesIcon, ShieldCheckIcon, BanknotesIcon, ScaleIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

// Firebase imports
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'

// Testimonial Interface
interface Testimonial {
  id: string
  name: string
  position: string
  company: string
  email: string
  message: string
  rating: number
  featured: boolean
  approved: boolean
  createdAt: any
  updatedAt: any
}

const faqCategories = [
  {
    title: 'Acquisition & Buying',
    icon: ShieldCheckIcon,
    questions: [
      {
        question: 'What documents are required for a luxury property acquisition?',
        answer: 'For a seamless transaction, we require a passport copy, proof of residence, and proof of funds. For international investors, we also facilitate the process of obtaining a Dubai Golden Visa through property investment.'
      },
      {
        question: 'Can non-residents own 100% of their property in Dubai?',
        answer: 'Absolutely. Dubai offers "Freehold" areas where international investors have 100% ownership rights. RAGDOL specializes exclusively in these high-growth, unrestricted zones.'
      },
      {
        question: 'What are the associated costs beyond the purchase price?',
        answer: 'Standard costs include a 4% Dubai Land Department (DLD) registration fee, a small administrative fee, and our professional brokerage fee. We provide a detailed "Cost of Acquisition" breakdown for every property.'
      }
    ]
  },
  {
    title: 'Investment & Yield',
    icon: BanknotesIcon,
    questions: [
      {
        question: 'What is the average rental yield for luxury properties?',
        answer: 'Dubai remains one of the world\'s highest-yielding markets. Luxury apartments typically yield 6-8% net, while ultra-luxury villas offer 4-6% alongside significant capital appreciation.'
      },
      {
        question: 'Is there any tax on rental income or capital gains?',
        answer: 'One of Dubai\'s greatest advantages is the 0% tax environment. There is no personal income tax on rentals and no capital gains tax on property appreciation.'
      }
    ]
  },
  {
    title: 'Legal & Compliance',
    icon: ScaleIcon,
    questions: [
      {
        question: 'How does RAGDOL ensure transaction security?',
        answer: 'Every transaction is processed through government-regulated escrow accounts. We work closely with the Dubai Land Department to ensure all title deeds are issued instantly upon completion.'
      },
      {
        question: 'What is the process for off-plan investments?',
        answer: 'Off-plan investments involve a structured payment plan linked to construction milestones. We only represent developers with a proven track record of excellence and timely delivery.'
      }
    ]
  }
]

// Fetch Testimonials from Firebase
async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    console.log('Fetching testimonials from Firebase...')
    const testimonialsRef = collection(db, 'testimonials')
    
    // Only fetch approved testimonials
    const q = query(
      testimonialsRef,
      where('approved', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    
    const testimonials: Testimonial[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      testimonials.push({
        id: doc.id,
        name: data.name || 'Anonymous',
        position: data.position || '',
        company: data.company || '',
        email: data.email || '',
        message: data.message || '',
        rating: data.rating || 5,
        featured: data.featured || false,
        approved: data.approved || false,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      })
    })
    
    // Sort by featured first, then by date
    testimonials.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1
      }
      
      const dateA = a.createdAt?.seconds || 0
      const dateB = b.createdAt?.seconds || 0
      return dateB - dateA // Newest first
    })
    
    console.log(`Found ${testimonials.length} approved testimonials from Firebase`)
    return testimonials
    
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [firebaseError, setFirebaseError] = useState('')

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  // Fetch testimonials on component mount
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true)
        const testimonialsData = await fetchTestimonials()
        setTestimonials(testimonialsData)
      } catch (error) {
        console.error('Error loading testimonials:', error)
        setFirebaseError('Unable to load testimonials from Firebase')
      } finally {
        setLoading(false)
      }
    }
    
    loadTestimonials()
  }, [])

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    try {
      if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      return 'N/A'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white text-sm font-bold tracking-widest uppercase rounded-full mb-6 backdrop-blur-sm">
            Client Testimonials
          </span>
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-8">
            What Our <span className="text-primary italic">Clients</span> Say
          </h1>
          
          
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mb-6">
              Real <span className="text-primary italic">Client</span> Experiences
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Read genuine feedback from our valued clients about their experience with RAGDOL Properties.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading testimonials from Firebase...</p>
            </div>
          ) : firebaseError ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Firebase Error</h3>
              <p className="text-slate-500 mb-4">{firebaseError}</p>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border ${testimonial.featured ? 'border-primary/30 border-2' : 'border-slate-100'} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/70`}
                >
                  <div className="p-8">
                    {/* Featured Badge */}
                    {testimonial.featured && (
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full inline-flex items-center gap-1">
                          <StarSolidIcon className="h-3 w-3" />
                          Featured
                        </span>
                      </div>
                    )}
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        i < testimonial.rating ? (
                          <StarSolidIcon key={i} className="h-5 w-5 text-amber-500" />
                        ) : (
                          <StarIcon key={i} className="h-5 w-5 text-amber-300" />
                        )
                      ))}
                      <span className="text-sm font-bold text-slate-700 ml-2">
                        {testimonial.rating}.0/5.0
                      </span>
                    </div>
                    
                    {/* Message */}
                    <div className="mb-6">
                      <p className="text-slate-700 italic leading-relaxed">
                        "{testimonial.message}"
                      </p>
                    </div>
                    
                    {/* Client Info */}
                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-secondary">{testimonial.name}</h4>
                          <span className="text-xs text-slate-500">
                            {formatTimestamp(testimonial.createdAt)}
                          </span>
                        </div>
                        
                        <div className="text-slate-600 text-sm space-y-1">
                          {testimonial.position && (
                            <p className="font-medium">{testimonial.position}</p>
                          )}
                          {testimonial.company && (
                            <p>at {testimonial.company}</p>
                          )}
                          {testimonial.email && (
                            <p className="text-slate-500 text-xs truncate">{testimonial.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Firebase Badge */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Approved</span>
                        </div>
                        <span>From Firebase</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-100 rounded-full">
                <StarIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Testimonials Found</h3>
              <p className="text-slate-500 mb-4 max-w-md mx-auto">
                No approved testimonials found in your Firebase database.
              </p>
              <div className="text-sm text-slate-400 space-y-1">
                <p>• Ensure testimonials have "approved: true" in Firestore</p>
                <p>• Check collection name is "testimonials"</p>
                <p>• Add rating between 1-5</p>
              </div>
            </div>
          )}

         
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-serif text-secondary mb-6">Ready to <span className="text-primary italic">Invest</span>?</h2>
            <p className="text-slate-500 text-lg mb-10">
              Join thousands of global investors who trust RAGDOL for their Dubai property portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300">
                View Listings
              </button>
              <button className="px-10 py-4 bg-white text-secondary border-2 border-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all duration-300">
                Download Guide
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}