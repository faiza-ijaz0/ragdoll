'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  StarIcon as StarSolid, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  LanguageIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid'
import { 
  StarIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  LinkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
// Firebase imports
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'

// Agent type definition
interface Agent {
  id: string
  title: string
  bio: string | null
  experience_years: number
  rating: number
  review_count: number
  total_sales: number
  profile_image: string | null
  created_at: string
  updated_at: string
  office: string
  license_no: string
  approved: boolean
  brokerage: string
  certifications: string[]
  commission_rate: number
  languages: string[]
  areas: string[]
  verified: boolean
  user_id: string
  whatsapp: string | null
  linkedin_url: string | null
  instagram_handle: string | null
  website_url: string | null
  location: string
  profile_images: string[]
  specializations: string[]
  telegram: string | null
}

// Firebase se agents fetch karne ka function
async function fetchRealAgents(): Promise<Agent[]> {
  try {
    console.log('Fetching REAL agents from Firebase...')
    const agentsRef = collection(db, 'agents')
    
    // Sirf approved agents fetch karo
    const q = query(
      agentsRef,
      where('approved', '==', true),
      limit(50)
    )
    
    const querySnapshot = await getDocs(q)
    
    const agents: Agent[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const agentTitle = data.title || 'Real Estate Agent'
      
      let profileImage = data.profile_image
      
      // If no direct profile_image, check profile_images array
      if (!profileImage && data.profile_images && Array.isArray(data.profile_images) && data.profile_images.length > 0) {
        profileImage = data.profile_images[0]
      }
      
      // If still no image, use initials placeholder
      if (!profileImage) {
        profileImage = '' // Will use placeholder div
      }
      
      agents.push({
        id: doc.id,
        title: agentTitle,
        bio: data.bio || null,
        experience_years: data.experience_years || 0,
        rating: data.rating || 0,
        review_count: data.review_count || 0,
        total_sales: data.total_sales || 0,
        profile_image: profileImage,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        office: data.office || 'Dubai',
        license_no: data.license_no || '',
        approved: data.approved || false,
        brokerage: data.brokerage || 'RAGDOL',
        certifications: data.certifications || [],
        commission_rate: data.commission_rate || 2.5,
        languages: data.languages || ['English', 'Arabic'],
        areas: data.areas || ['Dubai'],
        verified: data.verified || false,
        user_id: data.user_id || doc.id,
        whatsapp: data.whatsapp || null,
        linkedin_url: data.linkedin_url || null,
        instagram_handle: data.instagram_handle || null,
        website_url: data.website_url || null,
        location: data.location || 'Dubai',
        profile_images: data.profile_images || [],
        specializations: data.specializations || ['Residential Properties'],
        telegram: data.telegram || null,
      })
    })
    
    console.log(`Found ${agents.length} REAL approved agents from Firebase`)
    
    // Experience ke hisaab se sort karo (highest first)
    agents.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0))
    
    return agents
  } catch (error) {
    console.error('Error fetching real agents from Firebase:', error)
    return []
  }
}

export default function AgentListClient() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Firebase se agents fetch karo
  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true)
      try {
        const realAgents = await fetchRealAgents()
        setAgents(realAgents)
      } catch (error) {
        console.error('Failed to load agents:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAgents()
  }, [])

  // Filter and search agents
  const filtered = agents.filter((agent) => {
    const name = agent.title || 'Agent'
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (agent.specializations || []).some((s) => s.toLowerCase().includes(filter.toLowerCase()))
    return matchesSearch && matchesFilter
  })

  // Helper function to get initials
  const getInitials = (name: string): string => {
    if (!name) return 'AG'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Helper function to get profile image
  const getProfileImage = (agent: Agent): string => {
    if (agent.profile_image && agent.profile_image !== '') {
      return agent.profile_image
    }
    
    if (agent.profile_images && Array.isArray(agent.profile_images) && agent.profile_images.length > 0) {
      const firstImage = agent.profile_images[0]
      if (firstImage && firstImage !== '') {
        return firstImage
      }
    }
    
    return ''
  }

  // Helper function to get WhatsApp URL
  const getWhatsAppUrl = (whatsapp: string | null): string => {
    if (!whatsapp) return '#'
    
    const cleanedNumber = whatsapp.replace(/\D/g, '')
    const finalNumber = cleanedNumber.startsWith('0') ? cleanedNumber.substring(1) : cleanedNumber
    
    return `https://wa.me/971${finalNumber}`
  }

  // Helper function to get Telegram URL
  const getTelegramUrl = (telegram: string | null): string => {
    if (!telegram) return '#'
    
    // Remove @ symbol if present
    const username = telegram.replace('@', '')
    return `https://t.me/${username}`
  }

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  // Open modal with agent details
  const openAgentModal = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowModal(true)
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  // Close modal
  const closeAgentModal = () => {
    setShowModal(false)
    setSelectedAgent(null)
    // Enable body scroll when modal is closed
    document.body.style.overflow = 'auto'
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/50">
        <section className="relative pt-32 pb-20 bg-secondary overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
                Our Elite <span className="text-primary">Property Experts</span>
              </h1>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
          </div>
        </section>
        
        <section className="py-20">
          <div className="container-custom">
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading real agents from Firebase...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <>
      <div className="w-full min-h-screen bg-slate-50/50">
        {/* Search & Filter Header */}
        <section className="relative pt-32 pb-20 bg-secondary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
                Our Elite <span className="text-primary">Property Experts</span>
              </h1>
              <p className="text-slate-300 text-lg">
                Connect with Dubai's most experienced real estate professionals. 
                Our agents are dedicated to finding your perfect property.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium bg-white/10 px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <span> {agents.length} Approved Agents</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="glass p-2 rounded-2xl flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search agents by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative group">
                    <button className="h-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white flex items-center gap-2 hover:bg-white/20 transition-all">
                      <AdjustmentsHorizontalIcon className="w-5 h-5" />
                      <span>Filters</span>
                    </button>
                  </div>
                  <button className="px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
                    Search
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {['all', 'Luxury', 'Commercial', 'Residential', 'Investment', 'New Developments'].map(
                  (spec) => (
                    <button
                      key={spec}
                      onClick={() => setFilter(spec)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        filter === spec
                          ? 'bg-primary text-secondary shadow-lg shadow-primary/20'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:border-primary/50 hover:text-white'
                      }`}
                    >
                      {spec === 'all' ? 'All Specialists' : spec}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Agents Grid */}
        <section className="py-20">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-serif text-secondary">
                  {filtered.length} {filtered.length === 1 ? 'Expert' : 'Experts'} Available
                </h2>
                <div className="w-20 h-1 bg-primary mt-2"></div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Sort by:</span>
                <select className="bg-transparent border-none focus:ring-0 font-semibold text-secondary cursor-pointer">
                  <option>Most Experienced</option>
                  <option>Top Rated</option>
                  <option>Most Properties</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filtered.map((agent) => {
                  const profileImage = getProfileImage(agent)
                  const hasImage = profileImage && profileImage !== ''
                  const initials = getInitials(agent.title)
                  
                  return (
                    <div 
                      key={agent.id} 
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                    >
                      {/* Agent Image */}
                      <div className="relative h-80 overflow-hidden">
                        {hasImage ? (
                          <img
                            src={profileImage}
                            alt={agent.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = 'none'
                              const parent = img.parentElement
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                    <div class="text-4xl font-bold text-primary opacity-50">
                                      ${initials}
                                    </div>
                                  </div>
                                `
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
                          >
                            <div className="text-4xl font-bold text-primary opacity-50">
                              {initials}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        
                        {/* Experience Badge */}
                        <div className="absolute top-4 right-4 bg-primary text-secondary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {agent.experience_years}+ Years Exp.
                        </div>

                        {/* Verification Badge */}
                        {agent.verified && (
                          <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="flex gap-2">
                            <a 
                              href={`tel:${agent.whatsapp || ''}`}
                              className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-lg hover:bg-primary hover:text-secondary hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                              <PhoneIcon className="w-4 h-4" />
                              <span className="text-xs font-bold">Call</span>
                            </a>
                            <a 
                              href={getWhatsAppUrl(agent.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-lg hover:bg-primary hover:text-secondary hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4" />
                              <span className="text-xs font-bold">WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Agent Info */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-serif text-secondary group-hover:text-primary transition-colors mb-1">
                            {agent.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">{agent.brokerage}</span>
                            {agent.license_no && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                License: {agent.license_no}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <StarSolid 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'text-primary' : 'text-slate-200'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-secondary">{agent.rating.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({agent.review_count} reviews)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Experience</div>
                            <div className="text-lg font-bold text-secondary">{agent.experience_years} years</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Specialty</div>
                            <div className="text-sm font-bold text-secondary truncate">
                              {agent.specializations?.[0] || 'Residential'}
                            </div>
                          </div>
                        </div>

                        {/* Languages */}
                        {agent.languages && agent.languages.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Languages</div>
                            <div className="flex flex-wrap gap-2">
                              {agent.languages.slice(0, 2).map((lang, idx) => (
                                <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                  {lang}
                                </span>
                              ))}
                              {agent.languages.length > 2 && (
                                <span className="text-xs text-slate-500">+{agent.languages.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={() => openAgentModal(agent)}
                          className="block w-full py-3 bg-secondary text-white text-center font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300"
                        >
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-serif text-secondary mb-2">No Experts Found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {agents.length === 0 
                    ? 'No approved agents found in Firebase. Add agents with "approved: true" to your database.'
                    : 'We couldn\'t find any agents matching your current search criteria. Try adjusting your filters or search term.'
                  }
                </p>
                {agents.length === 0 && (
                  <div className="mt-4 text-sm text-slate-400 space-y-1">
                    <p>• Ensure agents have "approved: true" in Firebase</p>
                    <p>• Add "title", "experience_years", and "specializations" fields</p>
                    <p>• Include "profile_image" or "profile_images" for agent photos</p>
                  </div>
                )}
                <button 
                  onClick={() => {setSearchTerm(''); setFilter('all');}}
                  className="mt-8 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Firebase Stats */}
            {agents.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">{agents.length}</div>
                    <div className="text-sm text-slate-500">Approved Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">
                      {Math.max(...agents.map(a => a.experience_years || 0))}+
                    </div>
                    <div className="text-sm text-slate-500">Max Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">
                      {agents.filter(a => a.verified).length}
                    </div>
                    <div className="text-sm text-slate-500">Verified Agents</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-20 bg-secondary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
          <div className="container-custom relative z-10">
            <div className="glass p-12 rounded-3xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                  Are you a <span className="text-primary">Real Estate Professional?</span>
                </h2>
                <p className="text-slate-900 text-lg">
                  Join Dubai's fastest-growing luxury real estate network. 
                  Get access to exclusive listings, premium tools, and a global client base.
                </p>
              
              </div>
              <Link 
                href="/careers" 
                className="px-10 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary-light transition-all whitespace-nowrap"
              >
                Join Our Team
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Agent Details Modal */}
      {showModal && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeAgentModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:text-primary hover:bg-white transition-all shadow-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="p-0">
              {/* Header with Image */}
              <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/20 to-secondary/20">
                {getProfileImage(selectedAgent) ? (
                  <img
                    src={getProfileImage(selectedAgent)}
                    alt={selectedAgent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="text-6xl font-bold text-primary opacity-50">
                      {getInitials(selectedAgent.title)}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Agent Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">
                        {selectedAgent.title}
                      </h2>
                      <p className="text-white/80 text-lg">{selectedAgent.brokerage}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      {selectedAgent.verified && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                          <CheckBadgeIcon className="w-4 h-4" />
                          Verified Agent
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-secondary text-sm font-bold rounded-full">
                        <BriefcaseIcon className="w-4 h-4" />
                        {selectedAgent.experience_years}+ Years
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Contact & Basic Info */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-primary" />
                        Contact Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* WhatsApp */}
                        {selectedAgent.whatsapp && (
                          <a
                            href={getWhatsAppUrl(selectedAgent.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold">WhatsApp</div>
                              <div className="text-sm">{selectedAgent.whatsapp}</div>
                            </div>
                          </a>
                        )}

                        {/* Telegram */}
                        {selectedAgent.telegram && (
                          <a
                            href={getTelegramUrl(selectedAgent.telegram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <PaperClipIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold">Telegram</div>
                              <div className="text-sm">{selectedAgent.telegram}</div>
                            </div>
                          </a>
                        )}

                        {/* LinkedIn */}
                        {selectedAgent.linkedin_url && (
                          <a
                            href={selectedAgent.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold">LinkedIn</div>
                              <div className="text-sm truncate">View Profile</div>
                            </div>
                          </a>
                        )}

                        {/* Website */}
                        {selectedAgent.website_url && (
                          <a
                            href={selectedAgent.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <GlobeAltIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold">Website</div>
                              <div className="text-sm truncate">Visit Website</div>
                            </div>
                          </a>
                        )}

                        {/* Instagram */}
                        {selectedAgent.instagram_handle && (
                          <a
                            href={`https://instagram.com/${selectedAgent.instagram_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
                          >
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold">Instagram</div>
                              <div className="text-sm">@{selectedAgent.instagram_handle.replace('@', '')}</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary" />
                        Basic Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">License No:</span>
                          <span className="font-semibold text-secondary">{selectedAgent.license_no || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">Office:</span>
                          <span className="font-semibold text-secondary">{selectedAgent.office}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">Location:</span>
                          <span className="font-semibold text-secondary">{selectedAgent.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">Commission:</span>
                          <span className="font-semibold text-secondary">{selectedAgent.commission_rate}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-slate-600">Total Sales:</span>
                          <span className="font-semibold text-secondary">
                            {selectedAgent.total_sales?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detailed Information */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Rating & Reviews */}
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-secondary mb-2">Agent Rating</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <StarSolid 
                                  key={i} 
                                  className={`w-5 h-5 ${i < Math.floor(selectedAgent.rating) ? 'text-yellow-500' : 'text-slate-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-2xl font-bold text-secondary">{selectedAgent.rating.toFixed(1)}</span>
                            <span className="text-slate-500">({selectedAgent.review_count} reviews)</span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                            <span className="font-semibold">Approved by RAGDOL</span>
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      {selectedAgent.bio && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-secondary mb-2">About Me</h4>
                          <p className="text-slate-600 leading-relaxed">{selectedAgent.bio}</p>
                        </div>
                      )}
                    </div>

                    {/* Specializations & Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Specializations */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                          <BriefcaseIcon className="w-5 h-5 text-primary" />
                          Specializations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.specializations?.map((spec, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Areas */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-primary" />
                          Areas Covered
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.areas?.map((area, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm font-semibold rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Languages & Certifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Languages */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                          <LanguageIcon className="w-5 h-5 text-primary" />
                          Languages
                        </h3>
                        <div className="space-y-2">
                          {selectedAgent.languages?.map((lang, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-700">{lang}</span>
                              <span className="text-sm text-slate-500">Fluent</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                          <CheckBadgeIcon className="w-5 h-5 text-primary" />
                          Certifications
                        </h3>
                        <div className="space-y-3">
                          {selectedAgent.certifications?.map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-slate-700 font-medium">{cert}</span>
                            </div>
                          ))}
                          {(!selectedAgent.certifications || selectedAgent.certifications.length === 0) && (
                            <p className="text-slate-500 italic">No certifications listed</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-secondary mb-4">Additional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Agent ID</p>
                          <p className="font-mono text-sm text-secondary">{selectedAgent.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Member Since</p>
                          <p className="font-semibold text-secondary">{formatDate(selectedAgent.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Last Updated</p>
                          <p className="font-semibold text-secondary">{formatDate(selectedAgent.updated_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Status</p>
                          <p className="font-semibold text-green-600">
                            {selectedAgent.approved ? 'Active & Approved' : 'Pending Approval'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={getWhatsAppUrl(selectedAgent.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                    <a
                      href={`tel:${selectedAgent.whatsapp || ''}`}
                      className="flex-1 bg-primary text-secondary py-3 px-6 rounded-xl font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      Call Now
                    </a>
                    <button
                      onClick={closeAgentModal}
                      className="flex-1 bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-bold text-center hover:bg-slate-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}