'use client'

import { useState, useEffect, useRef } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon, PhotoIcon, VideoCameraIcon, FolderIcon, CloudIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { db, Timestamp, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from '@/lib/firebase'

interface Project {
  id: string
  name: string
  slug?: string
  status: string
  developer_id?: string
  city: string
  area?: string
  district?: string
  address?: string
  hero_image_url?: string
  description?: string
  starting_price?: number
  min_price?: number
  max_price?: number
  currency: string
  total_units?: number
  available_units?: number
  sold_units?: number
  amenities?: string[]
  facilities?: string[]
  property_types?: string[]
  featured: boolean
  published: boolean
  launch_date?: string
  completion_date?: string
  handover_date?: string
  payment_plan?: string
  payment_terms?: any
  // Updated fields with Base64 support
  brochures?: Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>
  other_documents?: Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>
  videos?: Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>
  hero_image?: { url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; fileType?: string } | null
  additional_images?: Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>
  // Keep old fields for backward compatibility
  brochure_url?: string
  video_url?: string
  images?: string[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  coords?: any
  created_at: string
  updated_at?: string
  inquiries_count?: number
  views_count?: number
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'planned' | 'in-progress' | 'completed'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'details' | 'seo'>('basic')
  const [isConverting, setIsConverting] = useState(false)
  
  // File input refs for different media types
  const fileInputRefs = {
    hero: useRef<HTMLInputElement>(null),
    brochure: useRef<HTMLInputElement>(null),
    document: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    image: useRef<HTMLInputElement>(null)
  }
  
  const [tempInput, setTempInput] = useState({
    amenity: '',
    facility: '',
    property_type: '',
    seo_keyword: '',
    // Media temp inputs
    brochure_url: '',
    other_document_url: '',
    video_url: '',
    hero_image_url: '',
    additional_image_url: '',
    // Google Drive specific
    google_drive_url: ''
  })

  const [showGoogleDriveInput, setShowGoogleDriveInput] = useState<{
    visible: boolean;
    target: 'brochure' | 'document' | 'video' | 'hero' | 'image' | null;
  }>({
    visible: false,
    target: null
  })

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    status: 'planned',
    developer_id: '',
    city: 'Dubai',
    area: '',
    district: '',
    address: '',
    description: '',
    
    // Pricing
    starting_price: '',
    min_price: '',
    max_price: '',
    currency: 'AED',
    
    // Units
    total_units: '',
    available_units: '',
    sold_units: '',
    
    // Arrays
    amenities: [] as string[],
    facilities: [] as string[],
    property_types: [] as string[],
    
    // Media - New Structure with Base64 support
    brochures: [] as Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>,
    other_documents: [] as Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>,
    videos: [] as Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>,
    hero_image: null as { url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; fileType?: string } | null,
    additional_images: [] as Array<{ url: string; type: 'url' | 'gallery' | 'google_drive' | 'base64'; name?: string; fileType?: string }>,
    
    // Keep old fields for backward compatibility
    brochure_url: '',
    video_url: '',
    images: [] as string[],
    
    // Flags
    featured: false,
    published: false,
    
    // Dates
    launch_date: '',
    completion_date: '',
    handover_date: '',
    
    // Payment
    payment_plan: '',
    payment_terms: '',
    
    // SEO
    seo_title: '',
    seo_description: '',
    seo_keywords: [] as string[],
    
    // Coordinates
    coords_lat: '',
    coords_lng: ''
  })

  // Load projects from Firebase
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoadingData(true)
      const projectsCollection = collection(db, "projects")
      const projectSnapshot = await getDocs(projectsCollection)
      
      const projectsList: Project[] = []
      projectSnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Ensure new fields exist with defaults
        const projectData: Project = {
          id: doc.id,
          ...data,
          brochures: data.brochures || [],
          other_documents: data.other_documents || [],
          videos: data.videos || [],
          hero_image: data.hero_image || null,
          additional_images: data.additional_images || [],
          created_at: data.created_at ?
            (typeof data.created_at === 'string' ? data.created_at :
              data.created_at.toDate ? data.created_at.toDate().toISOString() :
                new Date().toISOString()) :
            new Date().toISOString(),
          updated_at: data.updated_at ?
            (typeof data.updated_at === 'string' ? data.updated_at :
              data.updated_at.toDate ? data.updated_at.toDate().toISOString() :
                new Date().toISOString()) :
            new Date().toISOString(),
          name: '',
          status: '',
          city: '',
          currency: '',
          featured: false,
          published: false
        }
        
        projectsList.push(projectData)
      })
      
      projectsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setProjects(projectsList)
    } catch (error) {
      console.error('Error loading projects:', error)
      alert('Failed to load projects. Please check console.')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const projectData: any = {
        // Basic Info
        name: formData.name.trim(),
        status: formData.status,
        developer_id: formData.developer_id.trim() || null,
        city: formData.city.trim(),
        area: formData.area.trim() || null,
        district: formData.district.trim() || null,
        address: formData.address.trim() || null,
        description: formData.description.trim() || null,
        
        // Pricing
        currency: formData.currency,
        
        // Arrays
        amenities: formData.amenities.length > 0 ? formData.amenities : [],
        facilities: formData.facilities.length > 0 ? formData.facilities : [],
        property_types: formData.property_types.length > 0 ? formData.property_types : [],
        
        // Media - New Structure with Base64
        brochures: formData.brochures,
        other_documents: formData.other_documents,
        videos: formData.videos,
        hero_image: formData.hero_image,
        additional_images: formData.additional_images,
        
        // Keep old fields populated for backward compatibility
        brochure_url: formData.brochures.length > 0 ? formData.brochures[0]?.url : null,
        video_url: formData.videos.length > 0 ? formData.videos[0]?.url : null,
        images: formData.additional_images.map(img => img.url),
        hero_image_url: formData.hero_image?.url || null,
        
        // Flags
        featured: formData.featured,
        published: formData.published,
        
        // Dates
        launch_date: formData.launch_date || null,
        completion_date: formData.completion_date || null,
        handover_date: formData.handover_date || null,
        
        // Payment
        payment_plan: formData.payment_plan.trim() || null,
        payment_terms: formData.payment_terms || null,
        
        // SEO
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        seo_keywords: formData.seo_keywords.length > 0 ? formData.seo_keywords : [],
        
        // Timestamps
        updated_at: new Date().toISOString(),
        inquiries_count: 0,
        views_count: 0
      }

      // Add numeric fields
      if (formData.starting_price.trim()) {
        projectData.starting_price = parseFloat(formData.starting_price)
      }
      if (formData.min_price.trim()) {
        projectData.min_price = parseFloat(formData.min_price)
      }
      if (formData.max_price.trim()) {
        projectData.max_price = parseFloat(formData.max_price)
      }
      if (formData.total_units.trim()) {
        projectData.total_units = parseInt(formData.total_units)
      }
      if (formData.available_units.trim()) {
        projectData.available_units = parseInt(formData.available_units)
      }
      if (formData.sold_units.trim()) {
        projectData.sold_units = parseInt(formData.sold_units)
      }

      // Add coordinates
      if (formData.coords_lat.trim() && formData.coords_lng.trim()) {
        projectData.coords = {
          lat: parseFloat(formData.coords_lat),
          lng: parseFloat(formData.coords_lng)
        }
      }

      if (editingProject) {
        // Update existing project
        const projectRef = doc(db, "projects", editingProject.id)
        projectData.created_at = editingProject.created_at
        
        await updateDoc(projectRef, projectData)
        
        const updatedProject = {
          id: editingProject.id,
          ...projectData
        } as Project
        
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p))
      } else {
        // Create new project
        projectData.created_at = new Date().toISOString()
        const docRef = await addDoc(collection(db, "projects"), projectData)
        
        const newProject = {
          id: docRef.id,
          ...projectData
        } as Project
        
        setProjects([newProject, ...projects])
      }
      
      closeModal()
      alert(editingProject ? 'Project updated successfully!' : 'Project created successfully!')
      
    } catch (error: any) {
      console.error('Error saving project:', error)
      alert(error.message || 'Error saving project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return

    try {
      const projectRef = doc(db, "projects", projectId)
      await deleteDoc(projectRef)
      setProjects(projects.filter(p => p.id !== projectId))
      alert('Project deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      alert('Error deleting project. Please try again.')
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      // Basic Info
      name: project.name,
      status: project.status,
      developer_id: project.developer_id || '',
      city: project.city,
      area: project.area || '',
      district: project.district || '',
      address: project.address || '',
      description: project.description || '',
      
      // Pricing
      starting_price: project.starting_price?.toString() || '',
      min_price: project.min_price?.toString() || '',
      max_price: project.max_price?.toString() || '',
      currency: project.currency,
      
      // Units
      total_units: project.total_units?.toString() || '',
      available_units: project.available_units?.toString() || '',
      sold_units: project.sold_units?.toString() || '',
      
      // Arrays
      amenities: project.amenities || [],
      facilities: project.facilities || [],
      property_types: project.property_types || [],
      
      // Media - New Structure with Base64
      brochures: project.brochures || [],
      other_documents: project.other_documents || [],
      videos: project.videos || [],
      hero_image: project.hero_image || null,
      additional_images: project.additional_images || [],
      
      // Keep old fields populated
      brochure_url: project.brochure_url || '',
      video_url: project.video_url || '',
      images: project.images || [],
      
      // Flags
      featured: project.featured,
      published: project.published,
      
      // Dates
      launch_date: project.launch_date || '',
      completion_date: project.completion_date || '',
      handover_date: project.handover_date || '',
      
      // Payment
      payment_plan: project.payment_plan || '',
      payment_terms: project.payment_terms || '',
      
      // SEO
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      seo_keywords: project.seo_keywords || [],
      
      // Coordinates
      coords_lat: project.coords?.lat?.toString() || '',
      coords_lng: project.coords?.lng?.toString() || ''
    })
    setShowModal(true)
    setActiveTab('basic')
  }

  const openAddModal = () => {
    setEditingProject(null)
    resetForm()
    setShowModal(true)
    setActiveTab('basic')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
    resetForm()
    setShowGoogleDriveInput({ visible: false, target: null })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      status: 'planned',
      developer_id: '',
      city: 'Dubai',
      area: '',
      district: '',
      address: '',
      description: '',
      starting_price: '',
      min_price: '',
      max_price: '',
      currency: 'AED',
      total_units: '',
      available_units: '',
      sold_units: '',
      amenities: [],
      facilities: [],
      property_types: [],
      brochures: [],
      other_documents: [],
      videos: [],
      hero_image: null,
      additional_images: [],
      brochure_url: '',
      video_url: '',
      images: [],
      featured: false,
      published: false,
      launch_date: '',
      completion_date: '',
      handover_date: '',
      payment_plan: '',
      payment_terms: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      coords_lat: '',
      coords_lng: ''
    })
    setTempInput({
      amenity: '',
      facility: '',
      property_type: '',
      seo_keyword: '',
      brochure_url: '',
      other_document_url: '',
      video_url: '',
      hero_image_url: '',
      additional_image_url: '',
      google_drive_url: ''
    })
  }

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Handle file selection from gallery
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, targetType: 'hero' | 'brochure' | 'document' | 'video' | 'image') => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsConverting(true)
    
    try {
      // Check file size (limit to 5MB for Base64 to avoid Firestore limits)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB for Base64 encoding')
        return
      }

      // Validate file type
      if (targetType === 'brochure' || targetType === 'document') {
        if (file.type !== 'application/pdf') {
          alert('Please select a PDF file')
          return
        }
      } else if (targetType === 'video') {
        if (!file.type.startsWith('video/')) {
          alert('Please select a video file')
          return
        }
      } else {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          return
        }
      }

      const base64 = await fileToBase64(file)
      const fileName = file.name
      const fileType = file.type

      switch (targetType) {
        case 'hero':
          setFormData({
            ...formData,
            hero_image: {
              url: base64,
              type: 'base64',
              fileType
            }
          })
          break
        case 'brochure':
          setFormData({
            ...formData,
            brochures: [...formData.brochures, {
              url: base64,
              type: 'base64',
              name: fileName,
              fileType
            }]
          })
          break
        case 'document':
          setFormData({
            ...formData,
            other_documents: [...formData.other_documents, {
              url: base64,
              type: 'base64',
              name: fileName,
              fileType
            }]
          })
          break
        case 'video':
          setFormData({
            ...formData,
            videos: [...formData.videos, {
              url: base64,
              type: 'base64',
              name: fileName,
              fileType
            }]
          })
          break
        case 'image':
          setFormData({
            ...formData,
            additional_images: [...formData.additional_images, {
              url: base64,
              type: 'base64',
              name: fileName,
              fileType
            }]
          })
          break
      }
    } catch (error) {
      console.error('Error converting file to Base64:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setIsConverting(false)
      // Clear the file input
      event.target.value = ''
    }
  }

  // Google Drive Handler
  const handleGoogleDriveSubmit = () => {
    if (!tempInput.google_drive_url.trim() || !showGoogleDriveInput.target) return

    const url = tempInput.google_drive_url.trim()
    const target = showGoogleDriveInput.target

    // Convert Google Drive sharing URL to direct link if needed
    let finalUrl = url
    if (url.includes('drive.google.com')) {
      if (url.includes('/file/d/')) {
        const fileId = url.split('/file/d/')[1].split('/')[0]
        finalUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      } else if (url.includes('id=')) {
        const fileId = url.split('id=')[1].split('&')[0]
        finalUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      }
    }

    switch (target) {
      case 'brochure':
        setFormData({
          ...formData,
          brochures: [...formData.brochures, {
            url: finalUrl,
            type: 'google_drive',
            name: `Brochure ${formData.brochures.length + 1} (Google Drive)`
          }]
        })
        break
      case 'document':
        setFormData({
          ...formData,
          other_documents: [...formData.other_documents, {
            url: finalUrl,
            type: 'google_drive',
            name: `Document ${formData.other_documents.length + 1} (Google Drive)`
          }]
        })
        break
      case 'video':
        setFormData({
          ...formData,
          videos: [...formData.videos, {
            url: finalUrl,
            type: 'google_drive',
            name: `Video ${formData.videos.length + 1} (Google Drive)`
          }]
        })
        break
      case 'hero':
        setFormData({
          ...formData,
          hero_image: {
            url: finalUrl,
            type: 'google_drive'
          }
        })
        break
      case 'image':
        setFormData({
          ...formData,
          additional_images: [...formData.additional_images, {
            url: finalUrl,
            type: 'google_drive',
            name: `Image ${formData.additional_images.length + 1} (Google Drive)`
          }]
        })
        break
    }

    setTempInput({ ...tempInput, google_drive_url: '' })
    setShowGoogleDriveInput({ visible: false, target: null })
  }

  // Media Handlers for URL inputs
  const addBrochure = (type: 'url') => {
    if (tempInput.brochure_url.trim()) {
      setFormData({
        ...formData,
        brochures: [...formData.brochures, {
          url: tempInput.brochure_url.trim(),
          type: 'url',
          name: `Brochure ${formData.brochures.length + 1}`
        }]
      })
      setTempInput({ ...tempInput, brochure_url: '' })
    }
  }

  const addOtherDocument = (type: 'url') => {
    if (tempInput.other_document_url.trim()) {
      setFormData({
        ...formData,
        other_documents: [...formData.other_documents, {
          url: tempInput.other_document_url.trim(),
          type: 'url',
          name: `Document ${formData.other_documents.length + 1}`
        }]
      })
      setTempInput({ ...tempInput, other_document_url: '' })
    }
  }

  const addVideo = (type: 'url') => {
    if (tempInput.video_url.trim()) {
      setFormData({
        ...formData,
        videos: [...formData.videos, {
          url: tempInput.video_url.trim(),
          type: 'url',
          name: `Video ${formData.videos.length + 1}`
        }]
      })
      setTempInput({ ...tempInput, video_url: '' })
    }
  }

  const setHeroImage = (type: 'url') => {
    if (tempInput.hero_image_url.trim()) {
      setFormData({
        ...formData,
        hero_image: {
          url: tempInput.hero_image_url.trim(),
          type: 'url'
        }
      })
      setTempInput({ ...tempInput, hero_image_url: '' })
    }
  }

  const addAdditionalImage = (type: 'url') => {
    if (tempInput.additional_image_url.trim()) {
      setFormData({
        ...formData,
        additional_images: [...formData.additional_images, {
          url: tempInput.additional_image_url.trim(),
          type: 'url',
          name: `Image ${formData.additional_images.length + 1}`
        }]
      })
      setTempInput({ ...tempInput, additional_image_url: '' })
    }
  }

  const removeMediaItem = (type: 'brochures' | 'other_documents' | 'videos' | 'additional_images', index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index)
    })
  }

  const removeHeroImage = () => {
    setFormData({
      ...formData,
      hero_image: null
    })
  }

  // Array Handlers
  const addToArray = (field: 'amenities' | 'facilities' | 'property_types' | 'seo_keywords', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()]
      })
    }
  }

  const removeFromArray = (field: 'amenities' | 'facilities' | 'property_types' | 'seo_keywords', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== value)
    })
  }

  const handleArrayInput = (field: keyof typeof tempInput, arrayField: 'amenities' | 'facilities' | 'property_types' | 'seo_keywords') => {
    if (tempInput[field].trim()) {
      addToArray(arrayField, tempInput[field] as string)
      setTempInput({ ...tempInput, [field]: '' })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, field: keyof typeof tempInput, arrayField: 'amenities' | 'facilities' | 'property_types' | 'seo_keywords') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleArrayInput(field, arrayField)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.area?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
        activeTab === tab
          ? 'bg-white text-blue-600 border-t-2 border-l border-r border-blue-500 -mb-px'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  // Google Drive Modal
  const GoogleDriveModal = () => {
    if (!showGoogleDriveInput.visible) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">Add from Google Drive</h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste your Google Drive sharing link below. Make sure the file is shared publicly.
          </p>
          <input
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            value={tempInput.google_drive_url}
            onChange={(e) => setTempInput({...tempInput, google_drive_url: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowGoogleDriveInput({ visible: false, target: null })}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGoogleDriveSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRefs.hero}
        onChange={(e) => handleFileSelect(e, 'hero')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefs.brochure}
        onChange={(e) => handleFileSelect(e, 'brochure')}
        accept=".pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefs.document}
        onChange={(e) => handleFileSelect(e, 'document')}
        accept=".pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefs.video}
        onChange={(e) => handleFileSelect(e, 'video')}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefs.image}
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Google Drive Modal */}
      <GoogleDriveModal />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-2">
              Manage real estate development projects with Base64 image support
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects from Firebase...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found. Click "Add New Project" to create one.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <li key={project.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Hero Image Preview */}
                        {project.hero_image?.url && (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={project.hero_image.url}
                            alt={project.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">
                            {project.city} • {project.area || 'No area'} • {project.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            {project.currency} {project.starting_price?.toLocaleString() || '0'} - {project.max_price?.toLocaleString() || '0'}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-xs text-gray-500" title="Brochures">
                              <DocumentIcon className="h-4 w-4 mr-1" />
                              {project.brochures?.length || 0}
                            </span>
                            <span className="flex items-center text-xs text-gray-500" title="Other Documents">
                              <FolderIcon className="h-4 w-4 mr-1" />
                              {project.other_documents?.length || 0}
                            </span>
                            <span className="flex items-center text-xs text-gray-500" title="Videos">
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                              {project.videos?.length || 0}
                            </span>
                            <span className="flex items-center text-xs text-gray-500" title="Additional Images">
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              {project.additional_images?.length || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.featured
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.featured ? 'Featured' : 'Standard'}
                        </span>
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 text-2xl"
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px space-x-4">
                  <TabButton tab="basic" label="Basic Info" />
                  <TabButton tab="media" label="Media" />
                  <TabButton tab="details" label="Details" />
                  <TabButton tab="seo" label="SEO" />
                </nav>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        >
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">City *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Area</label>
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Developer ID</label>
                        <input
                          type="text"
                          value={formData.developer_id}
                          onChange={(e) => setFormData({...formData, developer_id: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input
                          id="featured"
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Featured Project</label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="published"
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData({...formData, published: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="published" className="ml-2 text-sm text-gray-700">Published</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Tab - Enhanced with Gallery Selection */}
                {activeTab === 'media' && (
                  <div className="space-y-8">
                    {/* Hero Image */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Hero Image</h4>
                      {formData.hero_image ? (
                        <div className="flex items-center space-x-4 mb-3">
                          <img src={formData.hero_image.url} alt="Hero" className="h-20 w-20 object-cover rounded" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 truncate">
                              {formData.hero_image.type === 'base64' ? 'Base64 Image' : formData.hero_image.url}
                            </p>
                            <p className="text-xs text-gray-500">
                              Type: {formData.hero_image.type === 'base64' ? 'Uploaded Image' : formData.hero_image.type}
                              {formData.hero_image.fileType && ` (${formData.hero_image.fileType})`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeHeroImage}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="Enter image URL"
                              value={tempInput.hero_image_url}
                              onChange={(e) => setTempInput({...tempInput, hero_image_url: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={isSubmitting || isConverting}
                            />
                            <button
                              type="button"
                              onClick={() => setHeroImage('url')}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              disabled={isSubmitting || isConverting}
                            >
                              Add URL
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRefs.hero.current?.click()}
                            className="w-full px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center"
                            disabled={isSubmitting || isConverting}
                          >
                            {isConverting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                                Converting...
                              </>
                            ) : (
                              <>
                                <PhotoIcon className="h-5 w-5 mr-2" />
                                Select from Gallery 
                              </>
                            )}
                          </button>
                          
                        </div>
                      )}
                    </div>

                    {/* Brochures */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Brochures (PDF)</h4>
                      
                      {/* List existing brochures */}
                      {formData.brochures.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {formData.brochures.map((brochure, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center space-x-2">
                                <DocumentIcon className="h-5 w-5 text-red-500" />
                                <div>
                                  <p className="text-sm text-gray-900 truncate max-w-xs">
                                    {brochure.name || `Brochure ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {brochure.type === 'base64' ? 'Base64 PDF' : brochure.url}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Type: {brochure.type === 'base64' ? 'Uploaded PDF' : brochure.type}
                                    {brochure.fileType && ` (${brochure.fileType})`}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMediaItem('brochures', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new brochure */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Enter PDF URL"
                            value={tempInput.brochure_url}
                            onChange={(e) => setTempInput({...tempInput, brochure_url: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting || isConverting}
                          />
                          <button
                            type="button"
                            onClick={() => addBrochure('url')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting || isConverting}
                          >
                            Add URL
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.brochure.current?.click()}
                          className="w-full px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          {isConverting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                              Select PDF from Gallery 
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGoogleDriveInput({ visible: true, target: 'brochure' })}
                          className="w-full px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          <CloudIcon className="h-5 w-5 mr-2" />
                          Add from Google Drive
                        </button>
                      </div>
                    </div>

                    {/* Other Documents */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Other Documents (PDF)</h4>
                      
                      {/* List existing documents */}
                      {formData.other_documents.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {formData.other_documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center space-x-2">
                                <FolderIcon className="h-5 w-5 text-orange-500" />
                                <div>
                                  <p className="text-sm text-gray-900 truncate max-w-xs">
                                    {doc.name || `Document ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {doc.type === 'base64' ? 'Base64 PDF' : doc.url}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Type: {doc.type === 'base64' ? 'Uploaded PDF' : doc.type}
                                    {doc.fileType && ` (${doc.fileType})`}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMediaItem('other_documents', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new document */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Enter PDF URL"
                            value={tempInput.other_document_url}
                            onChange={(e) => setTempInput({...tempInput, other_document_url: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting || isConverting}
                          />
                          <button
                            type="button"
                            onClick={() => addOtherDocument('url')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting || isConverting}
                          >
                            Add URL
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.document.current?.click()}
                          className="w-full px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          {isConverting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                              Select PDF from Gallery 
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGoogleDriveInput({ visible: true, target: 'document' })}
                          className="w-full px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          <CloudIcon className="h-5 w-5 mr-2" />
                          Add from Google Drive
                        </button>
                      </div>
                    </div>

                    {/* Videos */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Videos</h4>
                      
                      {/* List existing videos */}
                      {formData.videos.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {formData.videos.map((video, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center space-x-2">
                                <VideoCameraIcon className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-sm text-gray-900 truncate max-w-xs">
                                    {video.name || `Video ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {video.type === 'base64' ? 'Base64 Video' : video.url}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Type: {video.type === 'base64' ? 'Uploaded Video' : video.type}
                                    {video.fileType && ` (${video.fileType})`}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMediaItem('videos', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new video */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Enter Video URL"
                            value={tempInput.video_url}
                            onChange={(e) => setTempInput({...tempInput, video_url: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting || isConverting}
                          />
                          <button
                            type="button"
                            onClick={() => addVideo('url')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting || isConverting}
                          >
                            Add URL
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.video.current?.click()}
                          className="w-full px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          {isConverting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                              Converting...
                            </>
                          ) : (
                            <>
                              <VideoCameraIcon className="h-5 w-5 mr-2" />
                              Select Video from Gallery 
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGoogleDriveInput({ visible: true, target: 'video' })}
                          className="w-full px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          <CloudIcon className="h-5 w-5 mr-2" />
                          Add from Google Drive
                        </button>
                      </div>
                    </div>

                    {/* Additional Images */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Additional Images</h4>
                      
                      {/* List existing images */}
                      {formData.additional_images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {formData.additional_images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img src={image.url} alt={`Additional ${index}`} className="h-20 w-full object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => removeMediaItem('additional_images', index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {image.type === 'base64' ? 'Uploaded' : image.type}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new image */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Enter Image URL"
                            value={tempInput.additional_image_url}
                            onChange={(e) => setTempInput({...tempInput, additional_image_url: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting || isConverting}
                          />
                          <button
                            type="button"
                            onClick={() => addAdditionalImage('url')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting || isConverting}
                          >
                            Add URL
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.image.current?.click()}
                          className="w-full px-3 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          {isConverting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700 mr-2"></div>
                              Converting...
                            </>
                          ) : (
                            <>
                              <PhotoIcon className="h-5 w-5 mr-2" />
                              Select Images from Gallery 
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGoogleDriveInput({ visible: true, target: 'image' })}
                          className="w-full px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                          disabled={isSubmitting || isConverting}
                        >
                          <CloudIcon className="h-5 w-5 mr-2" />
                          Add from Google Drive
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Starting Price</label>
                        <input
                          type="number"
                          value={formData.starting_price}
                          onChange={(e) => setFormData({...formData, starting_price: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Min Price</label>
                        <input
                          type="number"
                          value={formData.min_price}
                          onChange={(e) => setFormData({...formData, min_price: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Price</label>
                        <input
                          type="number"
                          value={formData.max_price}
                          onChange={(e) => setFormData({...formData, max_price: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    {/* Units */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Units</label>
                        <input
                          type="number"
                          value={formData.total_units}
                          onChange={(e) => setFormData({...formData, total_units: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Available Units</label>
                        <input
                          type="number"
                          value={formData.available_units}
                          onChange={(e) => setFormData({...formData, available_units: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sold Units</label>
                        <input
                          type="number"
                          value={formData.sold_units}
                          onChange={(e) => setFormData({...formData, sold_units: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Launch Date</label>
                        <input
                          type="date"
                          value={formData.launch_date}
                          onChange={(e) => setFormData({...formData, launch_date: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                        <input
                          type="date"
                          value={formData.completion_date}
                          onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Handover Date</label>
                        <input
                          type="date"
                          value={formData.handover_date}
                          onChange={(e) => setFormData({...formData, handover_date: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amenities</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add amenity"
                          value={tempInput.amenity}
                          onChange={(e) => setTempInput({...tempInput, amenity: e.target.value})}
                          onKeyPress={(e) => handleKeyPress(e, 'amenity', 'amenities')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => handleArrayInput('amenity', 'amenities')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.amenities.map((amenity, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeFromArray('amenities', amenity)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Facilities</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add facility"
                          value={tempInput.facility}
                          onChange={(e) => setTempInput({...tempInput, facility: e.target.value})}
                          onKeyPress={(e) => handleKeyPress(e, 'facility', 'facilities')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => handleArrayInput('facility', 'facilities')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.facilities.map((facility, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {facility}
                            <button
                              type="button"
                              onClick={() => removeFromArray('facilities', facility)}
                              className="ml-1 text-green-600 hover:text-green-800"
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Property Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Property Types</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add property type"
                          value={tempInput.property_type}
                          onChange={(e) => setTempInput({...tempInput, property_type: e.target.value})}
                          onKeyPress={(e) => handleKeyPress(e, 'property_type', 'property_types')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => handleArrayInput('property_type', 'property_types')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.property_types.map((type, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            {type}
                            <button
                              type="button"
                              onClick={() => removeFromArray('property_types', type)}
                              className="ml-1 text-purple-600 hover:text-purple-800"
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Payment Plan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Plan</label>
                      <textarea
                        rows={2}
                        value={formData.payment_plan}
                        onChange={(e) => setFormData({...formData, payment_plan: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.coords_lat}
                          onChange={(e) => setFormData({...formData, coords_lat: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.coords_lng}
                          onChange={(e) => setFormData({...formData, coords_lng: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                      <textarea
                        rows={3}
                        value={formData.seo_description}
                        onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add keyword"
                          value={tempInput.seo_keyword}
                          onChange={(e) => setTempInput({...tempInput, seo_keyword: e.target.value})}
                          onKeyPress={(e) => handleKeyPress(e, 'seo_keyword', 'seo_keywords')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => handleArrayInput('seo_keyword', 'seo_keywords')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.seo_keywords.map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeFromArray('seo_keywords', keyword)}
                              className="ml-1 text-gray-600 hover:text-gray-800"
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-between pt-6 border-t">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'basic') setActiveTab('media')
                        else if (activeTab === 'media') setActiveTab('details')
                        else if (activeTab === 'details') setActiveTab('seo')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={activeTab === 'seo' || isSubmitting || isConverting}
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'seo') setActiveTab('details')
                        else if (activeTab === 'details') setActiveTab('media')
                        else if (activeTab === 'media') setActiveTab('basic')
                      }}
                      className="ml-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      disabled={activeTab === 'basic' || isSubmitting || isConverting}
                    >
                      Previous
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting || isConverting}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isConverting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingProject ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : (
                        editingProject ? 'Update Project' : 'Create Project'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}