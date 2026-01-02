'use client'

import { useState, useEffect } from 'react'
import { 
  BuildingOffice2Icon,
  XMarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
// Firebase imports
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query
} from 'firebase/firestore'

// Partner Interface
interface Partner {
  id: string
  name: string
  category: string
  description: string
  logo: string
  website: string
  featured: boolean
  order: number
  active: boolean
  createdAt: any
  updatedAt: any
}

// Partner Detail Modal Component
const PartnerDetailModal = ({ partner, isOpen, onClose }: { 
  partner: Partner | null, 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  if (!isOpen || !partner) return null

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    try {
      // Firebase timestamp format
      if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      // Regular date string
      return new Date(timestamp).toLocaleString()
    } catch (error) {
      return 'Invalid Date'
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={`${partner.name} Logo`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary">{partner.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                    {partner.category}
                  </span>
                  {partner.featured && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                      <StarSolidIcon className="h-3 w-3" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Status</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${partner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {partner.active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Order</span>
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    #{partner.order}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-primary" />
                  Description
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700">
                    {partner.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Website Link */}
              {partner.website && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5 text-primary" />
                    Website
                  </h3>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{partner.website}</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column - Technical Details */}
            <div className="space-y-6">
              {/* Firebase Document ID */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Document ID</h3>
                <div className="bg-slate-900 rounded-xl p-4">
                  <code className="text-sm text-slate-300 font-mono break-all">
                    {partner.id}
                  </code>
                </div>
              </div>

              

            
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
            
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Visit Website
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fetch Partners from Firebase
async function fetchPartners(): Promise<Partner[]> {
  try {
    console.log('Fetching partners from Firebase...')
    const partnersRef = collection(db, 'partners')
    
    const q = query(partnersRef)
    const querySnapshot = await getDocs(q)
    
    const partners: Partner[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (data.active === true) {
        partners.push({
          id: doc.id,
          name: data.name || 'Partner',
          category: data.category || 'Real Estate',
          description: data.description || '',
          logo: data.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          website: data.website || '',
          featured: data.featured || false,
          order: data.order || 0,
          active: data.active || false,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      }
    })
    
    partners.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      return a.name.localeCompare(b.name)
    })
    
    console.log(`Found ${partners.length} active partners from Firebase`)
    return partners
    
  } catch (error) {
    console.error('Error fetching partners:', error)
    return []
  }
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [firebaseError, setFirebaseError] = useState('')
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openPartnerModal = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsModalOpen(true)
  }

  const closePartnerModal = () => {
    setIsModalOpen(false)
    setSelectedPartner(null)
  }

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true)
        const partnersData = await fetchPartners()
        setPartners(partnersData)
      } catch (error) {
        console.error('Error loading partners:', error)
        setFirebaseError('Unable to load partners from Firebase')
      } finally {
        setLoading(false)
      }
    }
    
    loadPartners()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white text-sm font-bold tracking-widest uppercase rounded-full mb-6 backdrop-blur-sm">
            Strategic Partnerships
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
            Our <span className="italic">Trusted</span> Partners
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Collaborating with industry leaders to deliver exceptional real estate experiences in Dubai.
          </p>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mb-6">
              Our <span className="text-primary italic">Network</span> of Excellence
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              We collaborate with the finest companies and professionals across various industries.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading partners</p>
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
          ) : partners.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {partners.map((partner) => (
                  <div 
                    key={partner.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 group hover:shadow-2xl hover:shadow-slate-200/70 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Logo Container */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
                      {partner.featured && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={() => openPartnerModal(partner)}
                          className="px-3 py-1 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-bold rounded hover:bg-white transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={partner.logo}
                          alt={`${partner.name} Logo`}
                          className="max-w-full max-h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
                            e.currentTarget.className = 'max-w-full max-h-full object-cover p-4'
                          }}
                        />
                      </div>
                      
                      <div className="absolute bottom-4 right-4">
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-bold rounded">
                          #{partner.order || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1">
                            {partner.name}
                          </h3>
                          <p className="text-slate-500 text-sm mt-1">
                            {partner.category}
                          </p>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-bold rounded ${partner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {partner.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {partner.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {partner.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <BuildingOffice2Icon className="h-4 w-4" />
                          <span>Partner</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary text-sm font-semibold hover:text-secondary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Website
                              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            onClick={() => openPartnerModal(partner)}
                            className="text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Stats */}
              
               
                 
                  <div>
                    
                
                  
                  <div>
                   
                  </div>
               
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-100 rounded-full">
                <BuildingOffice2Icon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Active Partners Found</h3>
             
            </div>
          )}

          {/* Firebase Status */}
          <div className="mt-12 text-center">
           
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-secondary to-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-8">
                Interested in <span className="italic">Partnering</span> with Us?
              </h2>
              <p className="text-lg text-white/80 mb-12">
                Join our network of elite partners and grow your business with Dubai's premier real estate agency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-block px-8 py-4 bg-white text-secondary font-bold rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-2xl shadow-white/20"
                >
                  Become a Partner
                </Link>
                <Link
                  href="/about"
                  className="inline-block px-8 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-white hover:bg-white/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Detail Modal */}
      <PartnerDetailModal 
        partner={selectedPartner}
        isOpen={isModalOpen}
        onClose={closePartnerModal}
      />
    </div>
  )
}