'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { CheckIcon, PhotoIcon, DocumentTextIcon, CurrencyDollarIcon, XMarkIcon, DocumentIcon, MapPinIcon, KeyIcon, ClipboardDocumentIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore'

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center border border-border">
      <div className="text-muted-foreground flex flex-col items-center gap-2">
        <MapPinIcon className="w-8 h-8 animate-bounce" />
        <p className="text-sm font-medium">Loading Map...</p>
      </div>
    </div>
  )
})

// Agent interface
interface Agent {
  id: string;
  title: string;
  profile_image?: string;
  office?: string;
  experience_years?: number;
  total_sales?: number;
  whatsapp?: string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  bio?: string;
  license_no?: string;
  location?: string;
  commission_rate?: number;
  brokerage?: string;
  telegram?: string;
  linkedin_url?: string;
  website_url?: string;
  instagram_handle?: string;
  specializations?: string[];
  areas?: string[];
  languages?: string[];
  certifications?: string[];
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

const steps = [
  { id: 1, title: 'Property Details', description: 'Tell us about your property' },
  { id: 2, title: 'Pricing & Photos', description: 'Set price and upload images' },
  { id: 3, title: 'Agent & Contact Info', description: 'Select agent and your contact information' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit for approval' },
]

// Features list for property
const FEATURES_LIST = [
  'Swimming Pool',
  'Premium Appliances',
  'Walk-in Closets',
  'Garden',
  'Rooftop Terrace',
  'Valet Parking',
  'Concierge Service',
  'Gym & Fitness Center',
  'Security System',
  'Smart Home',
  'Central AC',
  'Private Garage',
  'Balcony',
  'Study Room',
  'Maid\'s Room',
  'Private Elevator'
]

export default function SellPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [passwordCopied, setPasswordCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    // Property Details
    propertyType: 'apartment',
    category: 'residential',
    bedrooms: '2',
    bathrooms: '2',
    area: '',
    location: '',
    address: '',
    latitude: 25.2048,
    longitude: 55.2708,
    price: '',
    description: '',
    
    // Features (selected from list)
    selectedFeatures: [] as string[],
    
    // Agent Selection
    selectedAgent: '',
    selectedAgentName: '',
    
    // Contact Info
    name: '',
    phone: '',
    email: '',
    nationality: '',
    preferredContact: 'whatsapp',
    userRole: 'owner',
    
    // Media
    photos: [] as File[],
    titleDeed: null as File | null,
    password: '',
    
    // Status
    status: 'rent',
    currency: 'AED',
    furnished: false,
    parking: 'yes',
    property_status: 'ready',
    published: false,
    review_status: 'pending',
  })

  const photoInputRef = useRef<HTMLInputElement>(null)
  const titleDeedInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ FIXED: Fetch agents from Firebase with error handling for index
  // ✅ CORRECTED: Agents fetch with proper error handling
useEffect(() => {
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true)
      
      // Try with orderBy first (requires index)
      try {
        const agentsRef = collection(db, 'agents')
        const q = query(agentsRef, where('approved', '==', true), orderBy('title', 'asc'))
        const querySnapshot = await getDocs(q)
        
        const agentsList: Agent[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Agent
          // ✅ FIXED: Don't spread data with id, use explicit assignment
          agentsList.push({
            id: doc.id,
            title: data.title || '',
            profile_image: data.profile_image,
            office: data.office,
            experience_years: data.experience_years,
            total_sales: data.total_sales,
            whatsapp: data.whatsapp,
            verified: data.verified,
            rating: data.rating,
            review_count: data.review_count,
            bio: data.bio,
            license_no: data.license_no,
            location: data.location,
            commission_rate: data.commission_rate,
            brokerage: data.brokerage,
            telegram: data.telegram,
            linkedin_url: data.linkedin_url,
            website_url: data.website_url,
            instagram_handle: data.instagram_handle,
            specializations: data.specializations,
            areas: data.areas,
            languages: data.languages,
            certifications: data.certifications,
            approved: data.approved,
            created_at: data.created_at,
            updated_at: data.updated_at
          })
        })
        
        setAgents(agentsList)
        console.log('✅ Agents fetched with index:', agentsList.length)
        
      } catch (indexError: any) {
        // If index error, fall back to client-side sorting
        console.warn('Index not found, using client-side sort:', indexError.message)
        
        toast.loading('Loading agents...', { id: 'agent-loading' })
        
        const agentsRef = collection(db, 'agents')
        const q = query(agentsRef, where('approved', '==', true))
        const querySnapshot = await getDocs(q)
        
        const agentsList: Agent[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Agent
          // ✅ FIXED: Same explicit assignment
          agentsList.push({
            id: doc.id,
            title: data.title || '',
            profile_image: data.profile_image,
            office: data.office,
            experience_years: data.experience_years,
            total_sales: data.total_sales,
            whatsapp: data.whatsapp,
            verified: data.verified,
            rating: data.rating,
            review_count: data.review_count,
            bio: data.bio,
            license_no: data.license_no,
            location: data.location,
            commission_rate: data.commission_rate,
            brokerage: data.brokerage,
            telegram: data.telegram,
            linkedin_url: data.linkedin_url,
            website_url: data.website_url,
            instagram_handle: data.instagram_handle,
            specializations: data.specializations,
            areas: data.areas,
            languages: data.languages,
            certifications: data.certifications,
            approved: data.approved,
            created_at: data.created_at,
            updated_at: data.updated_at
          })
        })
        
        // Client-side sorting
        agentsList.sort((a, b) => a.title.localeCompare(b.title))
        
        setAgents(agentsList)
        console.log('✅ Agents fetched with client-side sort:', agentsList.length)
        
        toast.success(`${agentsList.length} agents loaded`, { id: 'agent-loading' })
      }
      
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents. Please refresh the page.')
    } finally {
      setLoadingAgents(false)
    }
  }
  
  fetchAgents()
}, [])

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Generate password on component mount or when needed
  useEffect(() => {
    setGeneratedPassword(generateRandomPassword())
  }, [])

  // Copy password to clipboard
  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setPasswordCopied(true)
      toast.success('Password copied to clipboard!')
      setTimeout(() => setPasswordCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy password:', error)
      toast.error('Failed to copy password')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle agent selection
  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value
    const selectedAgent = agents.find(a => a.id === agentId)
    
    setFormData(prev => ({
      ...prev,
      selectedAgent: agentId,
      selectedAgentName: selectedAgent?.title || ''
    }))
  }

  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }))
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'titleDeed') => {
    const files = e.target.files
    if (!files) return

    const MAX_SIZE = 1024 * 1024 // 1MB

    if (type === 'photos') {
      const newPhotos = Array.from(files)
      const validPhotos = newPhotos.filter(file => {
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} is too large. Max size is 1MB.`)
          return false
        }
        return true
      })
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...validPhotos] }))
    } else {
      const file = files[0]
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is too large. Max size is 1MB.`)
        return
      }
      setFormData(prev => ({ ...prev, [type]: file }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const removeFile = (type: 'titleDeed') => {
    setFormData(prev => ({ ...prev, [type]: null }))
  }

  const handleLocationChange = useCallback((lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address,
      address: address
    }))
  }, [])

  // Submit to Firebase
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Validation
      if (!formData.selectedAgent) {
        toast.error('Please select an agent')
        setIsSubmitting(false)
        return
      }

      if (!formData.name || !formData.phone || !formData.email) {
        toast.error('Please fill all required contact fields')
        setIsSubmitting(false)
        return
      }

      if (!formData.price) {
        toast.error('Please enter a price')
        setIsSubmitting(false)
        return
      }

      if (formData.photos.length === 0) {
        toast.error('Please upload at least one photo')
        setIsSubmitting(false)
        return
      }

      // Convert photos to base64
      const photoBase64Promises = formData.photos.map(file => fileToBase64(file))
      const photoBase64 = await Promise.all(photoBase64Promises)
      
      // Convert title deed to base64 if exists
      let titleDeedBase64 = null
      if (formData.titleDeed) {
        titleDeedBase64 = await fileToBase64(formData.titleDeed)
      }

      // Prepare data for Firebase
      const propertyData = {
        // Basic Info
        title: formData.location ? `Property in ${formData.location}` : 'New Property',
        description: formData.description || 'This is my new property',
        type: formData.propertyType,
        category: formData.category,
        
        // Location
        address: formData.address || formData.location || 'downtown dubai',
        area: formData.location || 'downtown dubai',
        city: 'Dubai',
        latitude: formData.latitude,
        longitude: formData.longitude,
        
        // Property Details
        beds: parseInt(formData.bedrooms) || 5,
        baths: parseInt(formData.bathrooms) || 3,
        sqft: parseInt(formData.area) || 5,
        price: parseInt(formData.price) || 2888,
        currency: formData.currency,
        status: formData.status,
        
        // Features
        features: formData.selectedFeatures.length > 0 ? formData.selectedFeatures : [
          'Swimming Pool',
          'Premium Appliances',
          'Walk-in Closets',
          'Garden',
          'Rooftop Terrace',
          'Valet Parking',
          'Concierge Service',
          'Gym & Fitness Center'
        ],
        
        // Images (base64)
        images: photoBase64,
        
        // Title Deed (base64)
        titleDeed: titleDeedBase64,
        
        // Password (for copy option)
        password: generatedPassword,
        
        // Additional Fields
        furnished: formData.furnished,
        parking: formData.parking,
        property_status: formData.property_status,
        
        // Status Fields - PENDING
        published: false,
        review_status: 'pending',
        
        // Agent Info - FROM SELECTED AGENT
        agent_id: formData.selectedAgent,
        agent_name: formData.selectedAgentName,
        
        // Timestamps
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        submitted_at: new Date().toISOString(),
        
        // Contact Info (optional - for internal use)
        contact_name: formData.name,
        contact_phone: formData.phone,
        contact_email: formData.email,
        contact_nationality: formData.nationality,
        preferred_contact: formData.preferredContact,
        user_role: formData.userRole,
      }

      console.log('📤 Submitting to Firebase (PENDING STATUS):', propertyData)

      // Save to Firebase - agent_properties collection
      const agentPropertiesRef = collection(db, 'agent_properties')
      const docRef = await addDoc(agentPropertiesRef, propertyData)
      
      console.log('✅ Property saved to Firebase with ID:', docRef.id)
      
      toast.success('Listing submitted successfully! It is now pending review by admin.')
      
      // Redirect to home or success page
      setTimeout(() => {
        router.push('/')
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error submitting listing:', error)
      toast.error('Failed to submit listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    // Validate step 1
    if (currentStep === 1) {
      if (!formData.location) {
        toast.error('Please enter property location')
        return
      }
      if (!formData.description) {
        toast.error('Please enter property description')
        return
      }
    }
    
    // Validate step 2
    if (currentStep === 2) {
      if (!formData.price) {
        toast.error('Please enter price')
        return
      }
      if (formData.photos.length === 0) {
        toast.error('Please upload at least one photo')
        return
      }
    }
    
    // Validate step 3
    if (currentStep === 3) {
      if (!formData.selectedAgent) {
        toast.error('Please select an agent')
        return
      }
      if (!formData.name) {
        toast.error('Please enter your name')
        return
      }
      if (!formData.phone) {
        toast.error('Please enter your phone number')
        return
      }
      if (!formData.email) {
        toast.error('Please enter your email')
        return
      }
    }
    
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/20 via-background to-secondary/10 py-20 md:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              List Your Property on <span className="text-gradient">RAGDOLL</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Submit your property for review. Select an agent from our verified list. Once approved, it will be live on our website.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Steps Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep >= step.id
                          ? 'bg-primary text-background'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {currentStep > step.id ? <CheckIcon className="w-6 h-6" /> : step.id}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-4 transition-all ${
                          currentStep > step.id ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">
                  {steps[currentStep - 1].title}
                </h3>
                <p className="text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-card border border-border rounded-lg p-8 mb-8 space-y-6">
              {/* Step 1: Property Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Property Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="luxury">Luxury</option>
                        <option value="off-plan">Off-Plan / New Projects</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Property Type
                      </label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="studio">Studio</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="office">Office</option>
                        <option value="retail">Retail</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Bedrooms
                      </label>
                      <select
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Bathrooms
                      </label>
                      <select
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Area (Sq Ft)
                      </label>
                      <input
                        type="number"
                        name="area"
                        placeholder="e.g., 1500"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-3 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-primary" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="e.g., Downtown Dubai, Dubai"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Or select directly from the map:
                      </p>
                      <LocationPicker 
                        lat={formData.latitude} 
                        lng={formData.longitude} 
                        onChange={handleLocationChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe your property, features, amenities..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                    />
                  </div>

                  {/* Features Selection */}
                  <div>
                    <label className="block font-semibold text-foreground mb-3">
                      Features & Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {FEATURES_LIST.map((feature) => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.selectedFeatures.includes(feature)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing & Photos */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                        Price (AED)
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="e.g., 2500000"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Listing Type
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>

                  {/* Photos Upload */}
                  <div>
                    <label className="block font-semibold text-foreground mb-3 flex items-center gap-2">
                      <PhotoIcon className="w-5 h-5 text-primary" />
                      Upload Photos 
                    </label>
                    <div 
                      onClick={() => photoInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                    >
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={(e) => handleFileChange(e, 'photos')}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <PhotoIcon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-foreground font-medium mb-1">
                        Click to upload  photos
                      </p>
                      
                    </div>

                    {/* Photo Previews */}
                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {formData.photos.map((file, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removePhoto(index)
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title Deed Upload */}
                  <div>
                    <label className="block font-semibold text-foreground mb-3 flex items-center gap-2">
                      <HomeIcon className="w-5 h-5 text-primary" />
                      Upload Title Deed 
                    </label>
                    {!formData.titleDeed ? (
                      <div 
                        onClick={() => titleDeedInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        <input
                          type="file"
                          ref={titleDeedInputRef}
                          onChange={(e) => handleFileChange(e, 'titleDeed')}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <HomeIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Upload Title Deed</p>
                      
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <HomeIcon className="w-6 h-6 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium text-foreground truncate">{formData.titleDeed.name}</p>
                            <p className="text-xs text-muted-foreground">{(formData.titleDeed.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile('titleDeed')} className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Password Copy Option */}
                  <div>
                   
                    
                  </div>

                  {/* Additional Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Parking
                      </label>
                      <select
                        name="parking"
                        value={formData.parking}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="covered">Covered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Furnished
                      </label>
                      <select
                        name="furnished"
                        value={formData.furnished ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, furnished: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Agent & Contact Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Agent Selection Dropdown */}
                  <div>
                    <label className="block font-semibold text-foreground mb-3 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      Select Agent
                    </label>
                    {loadingAgents ? (
                      <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-muted-foreground">Loading agents...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.selectedAgent}
                        onChange={handleAgentChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="">Select an agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.title} - {agent.brokerage || 'Agent'} {agent.verified ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {/* Selected Agent Preview */}
                    {formData.selectedAgent && (
                      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <h4 className="font-semibold text-foreground mb-2">Selected Agent</h4>
                        {(() => {
                          const agent = agents.find(a => a.id === formData.selectedAgent)
                          return agent ? (
                            <div className="flex items-center gap-3">
                              {agent.profile_image && (
                                <img 
                                  src={agent.profile_image} 
                                  alt={agent.title}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                />
                              )}
                              <div>
                                <p className="font-bold text-foreground">{agent.title}</p>
                                <p className="text-sm text-muted-foreground">{agent.brokerage} • {agent.experience_years} years exp.</p>
                                {agent.verified && (
                                  <span className="text-xs text-green-600 font-semibold">✓ Verified Agent</span>
                                )}
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Your Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        placeholder="e.g., Emirati, British, Indian"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+971 XX XXX XXXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        I am a...
                      </label>
                      <select
                        name="userRole"
                        value={formData.userRole}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="owner">Property Owner</option>
                        <option value="agent">Real Estate Agent</option>
                        <option value="developer">Developer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-3">
                        Preferred Contact Method
                      </label>
                      <select
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-background border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-4">Review Your Listing</h3>
                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-semibold text-foreground ml-2 capitalize">
                          {formData.category}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Property Type:</span>
                        <span className="font-semibold text-foreground ml-2 capitalize">
                          {formData.propertyType}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-semibold text-foreground ml-2">{formData.location}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-semibold text-foreground ml-2">{formData.address || formData.location || 'downtown dubai'}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold text-primary text-lg ml-2">
                          AED {formData.price ? parseInt(formData.price).toLocaleString() : '0'}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Listing Type:</span>
                        <span className="font-semibold text-foreground ml-2 capitalize">{formData.status}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bedrooms:</span>
                        <span className="font-semibold text-foreground ml-2">{formData.bedrooms}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bathrooms:</span>
                        <span className="font-semibold text-foreground ml-2">{formData.bathrooms}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-semibold text-foreground ml-2">{formData.area || '5'} sqft</span>
                      </p>
                      
                      {/* Features */}
                      {formData.selectedFeatures.length > 0 && (
                        <div className="pt-4 border-t border-border mt-4">
                          <h4 className="font-semibold text-foreground mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedFeatures.map((feature, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Agent Info */}
                      {formData.selectedAgent && (
                        <div className="pt-4 border-t border-border mt-4">
                          <h4 className="font-semibold text-foreground mb-2">Selected Agent</h4>
                          {(() => {
                            const agent = agents.find(a => a.id === formData.selectedAgent)
                            return agent ? (
                              <div className="flex items-center gap-3">
                                {agent.profile_image && (
                                  <img 
                                    src={agent.profile_image} 
                                    alt={agent.title}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-foreground">{agent.title}</p>
                                  <p className="text-xs text-muted-foreground">{agent.brokerage}</p>
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-border mt-4 space-y-2">
                        <h4 className="font-semibold text-foreground mb-2">Your Contact Details</h4>
                        <p>
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-semibold text-foreground ml-2">{formData.name} ({formData.userRole})</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Nationality:</span>
                          <span className="font-semibold text-foreground ml-2">{formData.nationality || 'Not specified'}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Preferred Contact:</span>
                          <span className="font-semibold text-foreground ml-2 capitalize">{formData.preferredContact}</span>
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-border mt-4 space-y-2">
                        <p className="flex items-center justify-between">
                          <span className="text-muted-foreground">Photos:</span>
                          <span className="font-semibold text-foreground">{formData.photos.length} images</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-muted-foreground">Title Deed:</span>
                          <span className={formData.titleDeed ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                            {formData.titleDeed ? "✓ Uploaded" : "✗ Missing"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⏳ Your listing will be submitted for <strong>admin approval</strong>. 
                      Once approved, it will be published on our website. You will receive a confirmation email.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {currentStep === 4 ? (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary text-background rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit for Review'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-primary text-background rounded-lg font-semibold hover:bg-primary/90 transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-card border-t border-border">
        <div className="container-custom">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Why List on <span className="text-gradient">RAGDOLL</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: '⚡', title: 'Quick & Easy', desc: 'List your property in just 5 minutes' },
              { icon: '💰', title: '100% Free', desc: 'No hidden fees or charges' },
              { icon: '📱', title: 'Wide Reach', desc: 'Reach thousands of buyers and renters' },
              { icon: '⭐', title: 'Top Featured', desc: 'Premium listing options available' },
              { icon: '👥', title: 'Direct Contact', desc: 'Connect directly with interested buyers' },
              { icon: '📊', title: 'Analytics', desc: 'Track views and inquiries' },
            ].map((benefit, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}