'use client'

import Link from 'next/link'
import { Database } from '@/lib/database.types'
import ListingCard from '@/components/property/ListingCard'
import PropertySlider from '@/components/property/PropertySlider'
import HeroSearch from '@/components/shared/HeroSearch'
import HeroImageSlider from '@/components/shared/HeroImageSlider'
import AgentSlider from '@/components/agent/AgentSlider'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import {
  BuildingOffice2Icon,
  HomeIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  NewspaperIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
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

type Property = Database['public']['Tables']['properties']['Row']
type AgentRow = Database['public']['Tables']['agents']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type AgentWithProfile = AgentRow & { profiles?: ProfileRow | null }

// Interface for UI properties
interface UIProperty {
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
}

// Interface for Project Videos
interface ProjectVideo {
  id: string
  title: string
  location: string
  videoUrl: string
  imageUrl: string
  status: string
  price: number
  isRealProject: boolean
}

// Firebase data fetching functions

// 1. Properties for Buy/Sale - Status = "buy" OR "sale" - INCLUDES AGENT PROPERTIES TOO
async function fetchFeaturedProperties(): Promise<UIProperty[]> {
  try {
    console.log('Fetching ALL properties for sale from Firebase...')
    
    const allProperties: UIProperty[] = []
    
    // Fetch from regular properties collection
    const propertiesRef = collection(db, 'properties')
    const q = query(propertiesRef, limit(50))
    const querySnapshot = await getDocs(q)
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (
        (data.status === 'buy' || data.status === 'sale') && 
        data.published !== false && 
        data.published !== 'false'
      ) {
        allProperties.push({
          id: doc.id,
          title: data.title || 'Untitled Property',
          price: data.price || 0,
          priceLabel: 'total',
          image: data.images && Array.isArray(data.images) && data.images.length > 0 
            ? data.images[0] 
            : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
          location: data.address ? 
            `${data.address}${data.area ? ', ' + data.area : ''}${data.city ? ', ' + data.city : ''}` 
            : 'Dubai, UAE',
          beds: data.beds || 0,
          baths: data.baths || 0,
          sqft: data.sqft || data.built_up_area || 0,
          type: data.type || 'Property',
          featured: data.featured || false,
        })
      }
    })
    
    console.log(`Found ${allProperties.length} properties for sale from main collection`)
    
    // Also fetch from agent_properties collection for buy/sale
    try {
      const agentPropertiesRef = collection(db, 'agent_properties')
      const agentQ = query(agentPropertiesRef, limit(30))
      const agentSnapshot = await getDocs(agentQ)
      
      agentSnapshot.forEach((doc) => {
        const data = doc.data()
        
        if (
          data.published !== false && 
          (data.status === 'buy' || data.status === 'sale')
        ) {
          allProperties.push({
            id: `agent_${doc.id}`,
            title: data.title || 'Agent Property',
            price: data.price || 0,
            priceLabel: 'total',
            image: data.images && Array.isArray(data.images) && data.images.length > 0 
              ? data.images[0] 
              : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
            location: data.address ? 
              `${data.address}${data.area ? ', ' + data.area : ''}${data.city ? ', ' + data.city : ''}` 
              : data.area || data.city || 'Location not specified',
            beds: data.beds || 0,
            baths: data.bathrooms || 0,
            sqft: data.sqft || 0,
            type: data.type || 'property',
            featured: data.featured || false,
          })
        }
      })
      
      console.log(`Added ${agentSnapshot.size} agent properties for sale`)
    } catch (agentError) {
      console.log('Could not fetch agent properties for sale:', agentError)
    }
    
    // Sort by latest first
    allProperties.sort((a, b) => b.id.localeCompare(a.id))
    
    // MAXIMUM 3 ITEMS
    return allProperties.slice(0, 3)
  } catch (error) {
    console.error('Error fetching sale properties:', error)
    return []
  }
}

// 2. Rental Properties - Status = "rent" - INCLUDES AGENT PROPERTIES TOO
async function fetchRentalProperties(): Promise<UIProperty[]> {
  try {
    console.log('Fetching ALL rental properties from Firebase...')
    
    const allRentalProperties: UIProperty[] = []
    
    // Fetch from regular properties collection
    const propertiesRef = collection(db, 'properties')
    const q = query(propertiesRef, limit(50))
    const querySnapshot = await getDocs(q)
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (data.status === 'rent' && data.published !== false && data.published !== 'false') {
        allRentalProperties.push({
          id: doc.id,
          title: data.title || 'Untitled Property',
          price: data.price || 0,
          priceLabel: 'per_month',
          image: data.images && Array.isArray(data.images) && data.images.length > 0 
            ? data.images[0] 
            : 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=800',
          location: data.address ? 
            `${data.address}${data.area ? ', ' + data.area : ''}${data.city ? ', ' + data.city : ''}` 
            : 'Dubai, UAE',
          beds: data.beds || 0,
          baths: data.baths || 0,
          sqft: data.sqft || data.built_up_area || 0,
          type: data.type || 'Property',
          featured: data.featured || false,
        })
      }
    })
    
    console.log(`Found ${allRentalProperties.length} rental properties from main collection`)
    
    // Also fetch from agent_properties collection for rent
    try {
      const agentPropertiesRef = collection(db, 'agent_properties')
      const agentQ = query(agentPropertiesRef, limit(30))
      const agentSnapshot = await getDocs(agentQ)
      
      agentSnapshot.forEach((doc) => {
        const data = doc.data()
        
        if (data.published !== false && data.status === 'rent') {
          allRentalProperties.push({
            id: `agent_${doc.id}`,
            title: data.title || 'Agent Rental Property',
            price: data.price || 0,
            priceLabel: 'per_month',
            image: data.images && Array.isArray(data.images) && data.images.length > 0 
              ? data.images[0] 
              : 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=800',
            location: data.address ? 
              `${data.address}${data.area ? ', ' + data.area : ''}${data.city ? ', ' + data.city : ''}` 
              : data.area || data.city || 'Location not specified',
            beds: data.beds || 0,
            baths: data.bathrooms || 0,
            sqft: data.sqft || 0,
            type: data.type || 'property',
            featured: data.featured || false,
          })
        }
      })
      
      console.log(`Added ${agentSnapshot.size} agent rental properties`)
    } catch (agentError) {
      console.log('Could not fetch agent rental properties:', agentError)
    }
    
    // Sort by latest first
    allRentalProperties.sort((a, b) => b.id.localeCompare(a.id))
    
    // MAXIMUM 3 ITEMS
    return allRentalProperties.slice(0, 3)
  } catch (error) {
    console.error('Error fetching rental properties:', error)
    return []
  }
}

// 3. REAL Project Videos - ONLY from Firebase - MAX 3
async function fetchProjectVideos(): Promise<ProjectVideo[]> {
  try {
    console.log('Fetching REAL projects for video showcase from Firebase...')
    const projectsRef = collection(db, 'projects')
    
    // Only fetch published projects
    const q = query(
      projectsRef,
      where('published', '==', true),
      limit(8)
    )
    
    const querySnapshot = await getDocs(q)
    
    const projectVideos: ProjectVideo[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Check if project has video_url OR images for display
      const hasVideoUrl = data.video_url && data.video_url !== '' && isVideoUrl(data.video_url)
      const hasImages = data.images && Array.isArray(data.images) && data.images.length > 0
      const heroImage = data.hero_image_url || (hasImages ? data.images[0] : '')
      
      // Only include projects that have either video or image for display
      if (data.published === true && (hasVideoUrl || hasImages)) {
        projectVideos.push({
          id: doc.id,
          title: data.name || 'Untitled Project',
          location: data.city || data.area || data.address || 'Dubai',
          videoUrl: data.video_url || '',
          imageUrl: heroImage || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
          status: data.status || 'in-progress',
          price: data.starting_price || data.min_price || 0,
          isRealProject: true
        })
      }
    })
    
    console.log(`Found ${projectVideos.length} REAL projects with videos/images`)
    
    // Add demo reels if less than 4 real projects
    const demoReels: ProjectVideo[] = [
      {
        id: 'demo_1',
        title: 'Luxury Marina Towers',
        location: 'Dubai Marina',
        videoUrl: 'https://res.cloudinary.com/thenprogrammer/video/upload/v1/demo/luxury-marina.mp4',
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=700&fit=crop',
        status: 'Available',
        price: 2500000,
        isRealProject: false
      },
      {
        id: 'demo_2',
        title: 'Palm Jumeirah Villas',
        location: 'Palm Jumeirah',
        videoUrl: 'https://res.cloudinary.com/thenprogrammer/video/upload/v1/demo/palm-villas.mp4',
        imageUrl: 'https://images.unsplash.com/photo-1566683377667-98a3bfe21f94?w=500&h=700&fit=crop',
        status: 'Available',
        price: 5000000,
        isRealProject: false
      },
      {
        id: 'demo_3',
        title: 'Downtown Apartments',
        location: 'Downtown Dubai',
        videoUrl: 'https://res.cloudinary.com/thenprogrammer/video/upload/v1/demo/downtown-apts.mp4',
        imageUrl: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=500&h=700&fit=crop',
        status: 'Available',
        price: 1800000,
        isRealProject: false
      },
      {
        id: 'demo_4',
        title: 'Emirates Hills Estate',
        location: 'Emirates Hills',
        videoUrl: 'https://res.cloudinary.com/thenprogrammer/video/upload/v1/demo/emirates-hills.mp4',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=700&fit=crop',
        status: 'Available',
        price: 3500000,
        isRealProject: false
      }
    ]
    
    // If less than 4 real projects, add demo reels to reach 4 total
    if (projectVideos.length < 4) {
      const remaining = 4 - projectVideos.length
      projectVideos.push(...demoReels.slice(0, remaining))
      console.log(`Added ${remaining} demo reels to reach 4 total`)
    }
    
    // MAXIMUM 4 ITEMS
    return projectVideos.slice(0, 4)
  } catch (error) {
    console.error('Error fetching project videos:', error)
    return []
  }
}

// 4. New Projects (for projects section) - MAX 3
async function fetchNewProjects() {
  try {
    console.log('Fetching projects from Firebase...')
    const projectsRef = collection(db, 'projects')
    
    const q = query(
      projectsRef, 
      where('published', '==', true), 
      limit(10)
    )
    
    const querySnapshot = await getDocs(q)
    
    const projects: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (data.published === true) {
        projects.push({
          id: doc.id,
          name: data.name || 'Untitled Project',
          location: data.city || data.address || data.area || 'Dubai',
          starting_price: data.starting_price || data.min_price || 0,
          hero_image_url: data.hero_image_url || 
            (data.images && Array.isArray(data.images) && data.images[0]) || 
            'https://images.pexels.com/photos/1396134/pexels-photo-1396134.jpeg?auto=compress&cs=tinysrgb&w=800',
          status: data.status || 'In Progress',
          developer: data.developer_name || data.developer || 'Unknown Developer',
          video_url: data.video_url || null,
          description: data.description || '',
          available_units: data.available_units || 0,
          total_units: data.total_units || 0
        })
      }
    })
    
    console.log(`Found ${projects.length} projects`)
    
    projects.sort((a, b) => b.id.localeCompare(a.id))
    
    // MAXIMUM 3 ITEMS
    return projects.slice(0, 3)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

// 5. Trusted Partners - MAX 3
async function fetchTrustedPartners() {
  try {
    console.log('Fetching partners from Firebase...')
    const partnersRef = collection(db, 'partners')
    
    const q = query(partnersRef, limit(10))
    const querySnapshot = await getDocs(q)
    
    const partners: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (data.active !== false) {
        partners.push({
          id: doc.id,
          name: data.name || 'Partner',
          logo: data.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          category: data.category || 'Real Estate',
          order: data.order || 0
        })
      }
    })
    
    console.log(`Found ${partners.length} partners`)
    
    partners.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    if (partners.length === 0) {
      return [
        {
          id: '1',
          name: 'Emaar',
          logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          category: 'Real Estate'
        },
        {
          id: '2',
          name: 'Sobha',
          logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          category: 'Real Estate'
        },
        {
          id: '3',
          name: 'Damac',
          logo: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          category: 'Real Estate'
        }
      ]
    }
    
    // MAXIMUM 3 ITEMS
    return partners.slice(0, 3)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return []
  }
}

// 6. Top Agents - MAX 3
async function fetchTopAgents(): Promise<AgentWithProfile[]> {
  try {
    console.log('Fetching agents from Firebase...')
    const agentsRef = collection(db, 'agents')
    
    const q = query(agentsRef, limit(15))
    const querySnapshot = await getDocs(q)
    
    const agents: AgentWithProfile[] = []
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data()
      
      if (data.approved !== false) {
        let profileData: ProfileRow | null = null
        try {
          if (data.user_id) {
            const profilesRef = collection(db, 'profiles')
            const profileQuery = query(
              profilesRef,
              where('user_id', '==', data.user_id),
              limit(1)
            )
            const profileSnapshot = await getDocs(profileQuery)
            
            if (!profileSnapshot.empty) {
              profileData = profileSnapshot.docs[0].data() as ProfileRow
            }
          }
        } catch (profileError) {
          console.log('No profile found for agent:', doc.id)
        }
        
        agents.push({
          id: doc.id,
          title: data.title || 'Real Estate Agent',
          bio: data.bio || 'Experienced real estate professional',
          experience_years: data.experience_years || 0,
          rating: data.rating || 0,
          review_count: data.review_count || 0,
          total_sales: data.total_sales || 0,
          profile_image: data.profile_image || 
            profileData?.avatar_url || 
            data.avatar || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.title || 'Agent')}&background=random`,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          office: data.office || 'Dubai',
          license_no: data.license_no || '',
          approved: data.approved || false,
          social: data.social || { linkedin: '', instagram: '' },
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
          profiles: profileData
        })
      }
    }
    
    console.log(`Found ${agents.length} agents`)
    
    agents.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    
    // MAXIMUM 3 ITEMS
    return agents.slice(0, 3)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return []
  }
}

// 7. Testimonials - MAX 3
async function fetchTestimonials() {
  try {
    console.log('Fetching testimonials from Firebase...')
    const testimonialsRef = collection(db, 'testimonials')
    
    const q = query(testimonialsRef, limit(10))
    const querySnapshot = await getDocs(q)
    
    const testimonials: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      if (data.approved !== false) {
        testimonials.push({
          id: doc.id,
          name: data.name || 'Anonymous',
          role: data.position || data.company || 'Client',
          content: data.message || 'Great service!',
          avatar: data.avatar || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Client')}&background=random`,
          createdAt: data.createdAt || new Date()
        })
      }
    })
    
    console.log(`Found ${testimonials.length} testimonials`)
    
    testimonials.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    
    // MAXIMUM 3 ITEMS
    return testimonials.slice(0, 3)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

// 8. Blog Posts - MAX 3
async function fetchBlogPosts() {
  try {
    console.log('Fetching blogs from Firebase...')
    const blogsRef = collection(db, 'blogs')
    
    const q = query(
      blogsRef,
      where('published', '==', true),
      limit(3)
    )
    
    const querySnapshot = await getDocs(q)
    const blogs: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      blogs.push({
        id: doc.id,
        title: data.title || 'Untitled Blog',
        date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'Recent',
        category: data.category || 'General',
        image: data.imageUrl || 'https://images.pexels.com/photos/1396130/pexels-photo-1396130.jpeg?auto=compress&cs=tinysrgb&w=800',
        excerpt: data.excerpt || '',
        author: data.author || 'Admin',
        readTime: data.readTime || '1 min read',
        slug: data.slug || doc.id
      })
    })
    
    console.log(`Found ${blogs.length} blog posts`)
    
    blogs.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0)
      const dateB = b.date ? new Date(b.date) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
    
    // MAXIMUM 3 ITEMS
    return blogs.slice(0, 3)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

// 11. Debug function to check Firebase connection
async function checkFirebaseConnection() {
  try {
    console.log('Checking Firebase connection...')
    const testRef = collection(db, 'properties')
    const testQuery = query(testRef, limit(1))
    const testSnapshot = await getDocs(testQuery)
    console.log('Firebase connection successful. Collections found:', testSnapshot.size)
    return true
  } catch (error) {
    console.error('Firebase connection failed:', error)
    return false
  }
}

// Helper function to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

// Helper function to get video source URL
const getVideoSource = (videoUrl: string): string => {
  if (!videoUrl) return ''
  
  if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/upload/')) {
    return videoUrl
  }
  
  if (videoUrl.startsWith('v')) {
    return `https://res.cloudinary.com/thenprogrammer/video/upload/${videoUrl}`
  }
  
  if (videoUrl.startsWith('http')) {
    return videoUrl
  }
  
  return videoUrl
}

export default function HomePage() {
  const { t } = useTranslation()
  
  // State for Firebase data
  const [featuredProperties, setFeaturedProperties] = useState<UIProperty[]>([])
  const [rentalProperties, setRentalProperties] = useState<UIProperty[]>([])
  const [projectVideos, setProjectVideos] = useState<ProjectVideo[]>([])
  const [newProjects, setNewProjects] = useState<any[]>([])
  const [trustedPartners, setTrustedPartners] = useState<any[]>([])
  const [topAgents, setTopAgents] = useState<AgentWithProfile[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  
  // Video controls state
  const [videoStates, setVideoStates] = useState<{[key: string]: {isPlaying: boolean, isMuted: boolean}}>({})
  
  // Video refs
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({})
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      console.log('Starting data fetch from Firebase...')
      
      try {
        const isConnected = await checkFirebaseConnection()
        setFirebaseConnected(isConnected)
        
        if (isConnected) {
          console.log('Firebase connected, fetching all data...')
          
          const [
            featuredData,
            rentalData,
            projectVideosData,
            projectsData,
            partnersData,
            agentsData,
            testimonialsData,
            blogsData
          ] = await Promise.all([
            fetchFeaturedProperties(), // INCLUDES AGENT PROPERTIES FOR BUY/SALE
            fetchRentalProperties(),   // INCLUDES AGENT PROPERTIES FOR RENT
            fetchProjectVideos(),
            fetchNewProjects(),
            fetchTrustedPartners(),
            fetchTopAgents(),
            fetchTestimonials(),
            fetchBlogPosts()
          ])
          
          console.log('Data fetched successfully:', {
            featured: featuredData.length,
            rental: rentalData.length,
            projectVideos: projectVideosData.length,
            projects: projectsData.length,
            partners: partnersData.length,
            agents: agentsData.length,
            testimonials: testimonialsData.length,
            blogs: blogsData.length
          })
          
          setFeaturedProperties(featuredData)
          setRentalProperties(rentalData)
          setProjectVideos(projectVideosData)
          setNewProjects(projectsData)
          setTrustedPartners(partnersData)
          setTopAgents(agentsData)
          setTestimonials(testimonialsData)
          setBlogPosts(blogsData)
          
          const initialVideoStates: {[key: string]: {isPlaying: boolean, isMuted: boolean}} = {}
          projectVideosData.forEach((project) => {
            initialVideoStates[project.id] = { isPlaying: false, isMuted: true }
          })
          setVideoStates(initialVideoStates)
        } else {
          console.log('Firebase not connected, using empty data')
          setProjectVideos([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setProjectVideos([])
      } finally {
        setLoading(false)
        console.log('Data fetch completed')
      }
    }
    
    fetchAllData()
  }, [])
  
  const togglePlayPause = (projectId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], isPlaying: !prev[projectId]?.isPlaying }
    }))
  }
  
  const toggleMute = (projectId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], isMuted: !prev[projectId]?.isMuted }
    }))
  }
  
  // Effect to handle video playback
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((projectId) => {
      const video = videoRefs.current[projectId]
      if (video) {
        if (videoStates[projectId]?.isPlaying) {
          video.play().catch(() => {
            console.log('Auto-play prevented for video:', projectId)
          })
        } else {
          video.pause()
        }
      }
    })
  }, [videoStates])
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600"></p>
          {!firebaseConnected && (
            <p className="text-amber-600 text-sm mt-2"></p>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Landing Section with Image Slider */}
      <section className="relative w-full h-[95vh] min-h-[700px] overflow-hidden">
        <HeroImageSlider />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <div className="container-custom w-full pt-20">
            <div className="text-center max-w-6xl mx-auto space-y-10">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-primary font-bold tracking-[0.4em] uppercase text-xs sm:text-sm drop-shadow-md">
                  {t('homepage.premiumRealEstate')}
                </h2>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-2xl leading-tight">
                  Find Your <span className="text-primary">Dream Home</span>
                </h1>
                <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg px-4 sm:px-0">
                  {t('homepage.discoverExclusiveProperties')}
                </p>
              </div>

              <div className="max-w-4xl mx-auto animate-slide-up [animation-delay:200ms]">
                <HeroSearch />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 pt-8 sm:pt-12 max-w-3xl mx-auto animate-fade-in [animation-delay:400ms] px-4 sm:px-0">
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {featuredProperties.length + rentalProperties.length + projectVideos.length}+
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{t('homepage.properties')}</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {testimonials.length * 100}+
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{t('homepage.happyClients')}</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {topAgents.length}+
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{t('homepage.expertAgents')}</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {Math.max(...topAgents.map(a => a.experience_years || 0))}+
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{t('homepage.yearsExperience')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section - MAX 3 */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 px-4 sm:px-0">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
                {t('homepage.visualExperience')}
              </h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary tracking-tight">
                Real <span className="text-primary">Project Showcase</span>
              </h3>
              <p className="text-slate-500 font-medium mt-4 text-sm sm:text-base">
                Explore our latest projects
              </p>
            </div>
            <Link href="/projects" className="btn-outline">
              View All Projects
            </Link>
          </div>
          
          {projectVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0">
              {projectVideos.slice(0, 4).map((project, index) => {
                const hasVideo = isVideoUrl(project.videoUrl)
                const videoSource = getVideoSource(project.videoUrl)
                
                return (
                  <div 
                    key={project.id} 
                    className="relative aspect-9/16 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group cursor-pointer animate-slide-up" 
                    style={{ animationDelay: `${index * 100}ms` }} 
                    onClick={() => togglePlayPause(project.id)}
                  >
                    {hasVideo ? (
                      <video
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        autoPlay={false}
                        muted={videoStates[project.id]?.isMuted}
                        loop={true}
                        playsInline
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[project.id] = el
                          }
                        }}
                        poster={project.imageUrl}
                      >
                        <source src={videoSource} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
                        }}
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-transparent to-transparent p-4 sm:p-6 flex flex-col justify-end">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-bold text-base sm:text-lg">{project.title}</h4>
                          <p className="text-white/70 text-sm font-medium">{project.location}</p>
                        </div>
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded">
                          {project.status}
                        </span>
                      </div>
                      <div className="text-primary font-bold text-sm">
                        {project.price > 0 ? (
                          <>
                            Starting from <span className="text-lg">AED {project.price?.toLocaleString() || '0'}</span>
                          </>
                        ) : (
                          <span className="text-white/70">Price on request</span>
                        )}
                      </div>
                    </div>

                    {hasVideo && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePlayPause(project.id)
                          }}
                          className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors"
                        >
                          {videoStates[project.id]?.isPlaying ? (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMute(project.id)
                          }}
                          className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors"
                        >
                          {videoStates[project.id]?.isMuted ? (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    )}

                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                          {videoStates[project.id]?.isPlaying ? (
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link 
                        href={`/projects/${project.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded">
                        LIVE
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-100 rounded-full">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Projects Found</h3>
            
              <div className="text-sm text-slate-400 space-y-1">
                <p>• Ensure projects have "published: true"</p>
                <p>• Add "video_url" or "images" field</p>
                <p>• Include "hero_image_url" for fallback</p>
              </div>
            </div>
          )}

          <div className="text-center mt-12 px-4 sm:px-0">
            
            <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
              
             
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners Section - MAX 3 */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16 px-4 sm:px-0">
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary tracking-tight mb-4 sm:mb-6">
              <span className="text-secondary">Trusted</span> <span className="text-primary">Partners</span>
               

            </h2>

             
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              {t('homepage.collaborateWithDevelopers')}
            </p>
              <Link href="/partners" className="btn-outline mt-3">
              View All partners
            </Link>
          </div>
         
        
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 px-4 sm:px-0">
            {trustedPartners.length > 0 ? (
              trustedPartners.slice(0, 3).map((partner, index) => (
                <div
                  key={partner.id || index}
                  className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} Logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
                      }}
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-secondary group-hover:text-primary transition-colors text-center">
                    {partner.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">{partner.category}</p>
                </div>
              ))
            ) : (
              <>
                <div className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
                      alt="Emaar Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-secondary group-hover:text-primary transition-colors text-center">
                    Emaar
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">Real Estate</p>
                </div>
                <div className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
                      alt="Sobha Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-secondary group-hover:text-primary transition-colors text-center">
                    Sobha
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">Real Estate</p>
                </div>
                <div className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
                      alt="Damac Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-secondary group-hover:text-primary transition-colors text-center">
                    Damac
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">Real Estate</p>
                </div>
              </>
            )}
          </div>

          {!firebaseConnected && trustedPartners.length === 0 && (
            <div className="text-center mt-6">
              <p className="text-amber-600 text-sm">Unable to load partners from Firebase. Using default partners.</p>
            </div>
          )}

          <div className="text-center mt-12 sm:mt-16 px-4 sm:px-0">
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
              {t('homepage.joinThousandsClients')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                <span>{t('homepage.trustedDevelopers')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{t('homepage.premiumProperties')}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{t('homepage.expertGuidance')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties for BUY/SAKE (INCLUDES AGENT PROPERTIES) */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
              {t('homepage.exclusiveSelection')}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
              {t('homepage.propertiesFor')} <span className="text-primary">{t('homepage.buyText')}</span>
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-6">
              Includes properties from our main listings and verified agents
            </p>
            <Link href="/properties" className="btn-outline">
              View All properties for buy
            </Link>
          </div>
          
          {featuredProperties.length > 0 ? (
            <PropertySlider 
              title=""
              properties={featuredProperties.slice(0, 3)}
              showCount={3}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No properties for sale found</p>
              <p className="text-sm text-slate-400">
                Add properties with status "buy" or "sale" and "published: true" in Firebase collections
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Properties for RENT (INCLUDES AGENT PROPERTIES) */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
              {t('homepage.rentalCollection')}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
              {t('homepage.propertiesFor')} <span className="text-primary">{t('homepage.rentText')}</span>
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-6">
              Includes properties from our main listings and verified agents
            </p>
              <Link href="/properties" className="btn-outline">
              View All properties for rent
            </Link>
          </div>
          
          {rentalProperties.length > 0 ? (
            <PropertySlider 
              title=""
              properties={rentalProperties.slice(0, 3)}
              showCount={3}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No properties for rent found</p>
              <p className="text-sm text-slate-400">
                Add properties with status "rent" and "published: true" in Firebase collections
              </p>
            </div>
          )}
        </div>
      </section>

      {/* New Projects Section - MAX 3 */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
                {t('homepage.futureLiving')}
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
                {t('homepage.newText')} <span className="text-primary">{t('homepage.projectsText')}</span>
              </h3>
            </div>
            <Link href="/projects" className="btn-outline">
              {t('homepage.viewAllProjects')}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newProjects.length > 0 ? (
              newProjects.slice(0, 3).map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 shadow-lg">
                    <img 
                      src={project.hero_image_url} 
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1396134/pexels-photo-1396134.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-secondary text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {project.status}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{project.name}</h4>
                  <p className="text-slate-500 font-medium text-sm mb-2">{project.location}</p>
                  <div className="text-primary font-bold text-sm">
                    Starting from <span className="text-lg">AED {project.starting_price?.toLocaleString() || '0'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-500 mb-4">No projects found</p>
                <p className="text-sm text-slate-400">Add projects with "published: true" in Firebase</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest News Section - MAX 3 */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
                Market Insights
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
                Latest <span className="text-primary">News & Articles</span>
              </h3>
            </div>
            <Link href="/news" className="btn-outline">
              View All Articles
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogPosts.length > 0 ? (
              blogPosts.slice(0, 3).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6 shadow-lg">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1396130/pexels-photo-1396130.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-bold uppercase tracking-widest">{post.date}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {post.author}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-2">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    {post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-xs font-bold">{post.readTime}</span>
                    <span className="text-slate-400 text-xs group-hover:text-primary transition-colors">
                      Read More →
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-500 mb-4">No blog posts found</p>
                <p className="text-sm text-slate-400">Add blog posts with "published: true" in Firebase</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Agents Section - MAX 3 */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
              Meet Our Experts
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
              Top <span className="text-primary">Real Estate Agents</span>
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-6">
              Work with Dubai's most experienced and trusted real estate professionals
            </p>
            <Link href="/agents" className="btn-outline">
              View All agents
            </Link>
          </div>
          
          {topAgents.length > 0 ? (
            <AgentSlider 
              agents={topAgents.slice(0, 3)}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No agents found</p>
         
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - MAX 3 */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
              Client Experiences
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
              What Our <span className="text-primary">Clients Say</span>
            </h3>
             <Link href="/clients" className="btn-outline">
              View All Clients
            </Link>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={testimonial.id || index} className="bg-slate-50 rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon key={i} className="h-5 w-5 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic text-lg mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-slate-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-500 mb-4">No testimonials found</p>
                <p className="text-sm text-slate-400">Add testimonials to "testimonials" collection in Firebase</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container-custom">
          <div className="relative rounded-[3rem] sm:rounded-[4rem] overflow-hidden bg-slate-900 py-16 sm:py-24 px-6 sm:px-8 md:px-16 text-center">
            <div className="absolute inset-0 opacity-40">
              <img 
                src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                alt="Dubai Skyline" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/80" />
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tight leading-tight">
                {t('homepage.readyToFindPerfectSpace')}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 font-medium leading-relaxed">
                {t('homepage.joinThousandsHomeowners')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link href="/properties" className="btn-primary rounded-full! px-8 sm:px-12! py-4 sm:py-5! text-base sm:text-lg! shadow-2xl shadow-primary/30">
                  {t('homepage.browseProperties')}
                </Link>
                <Link href="/contact" className="btn-outline border-white! text-white! hover:bg-white! hover:text-slate-900! rounded-full! px-8 sm:px-12! py-4 sm:py-5! text-base sm:text-lg! backdrop-blur-md">
                  {t('homepage.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}