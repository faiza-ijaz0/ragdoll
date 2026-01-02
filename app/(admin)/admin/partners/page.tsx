
'use client';

import { useState, useEffect } from 'react'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhotoIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

interface Partner {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  category?: string
  featured: boolean
  active: boolean
  order: number
  createdAt: any
  updatedAt: any
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    category: '',
    featured: false,
    active: true,
    order: 0
  })

  // Predefined categories for dropdown
  const categories = [
    'Real Estate Developer',
    'Banking Partner',
    'Construction',
    'Interior Design',
    'Property Management',
    'Legal Services',
    'Home Inspection',
    'Mortgage Services',
    'Architecture',
    'Engineering',
    'Insurance',
    'Other'
  ]

  // Fetch partners from Firebase
  const fetchPartners = async () => {
    try {
      setLoading(true)
      console.log('Fetching partners from Firebase...')

      const partnersRef = collection(db, 'partners')
      const snapshot = await getDocs(partnersRef)

      const partnersData: Partner[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        partnersData.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          logo: data.logo || '',
          website: data.website || '',
          category: data.category || '',
          featured: data.featured || false,
          active: data.active !== false, // Default to true
          order: data.order || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        })
      })

      // Sort by order (ascending), then by creation date (newest first)
      partnersData.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order
        }
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      setPartners(partnersData)
      console.log('Partners loaded:', partnersData.length)
    } catch (error) {
      console.error('Error fetching partners:', error)
      alert('Failed to load partners. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Partner name is required')
      return
    }

    // Validate website URL format
    if (formData.website && !formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      formData.website = 'https://' + formData.website
    }

    try {
      setIsSubmitting(true)
      
      const partnerData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim(),
        website: formData.website.trim(),
        category: formData.category.trim(),
        featured: formData.featured,
        active: formData.active,
        order: formData.order || 0,
        updatedAt: serverTimestamp()
      }

      if (editingPartner) {
        // Update existing partner
        const partnerRef = doc(db, 'partners', editingPartner.id)
        await updateDoc(partnerRef, {
          ...partnerData,
          createdAt: editingPartner.createdAt || serverTimestamp()
        })
        console.log('Partner updated:', editingPartner.id)
      } else {
        // Add new partner
        const docRef = await addDoc(collection(db, 'partners'), {
          ...partnerData,
          createdAt: serverTimestamp()
        })
        console.log('Partner added with ID:', docRef.id)
      }

      // Reset form and refresh list
      resetForm()
      await fetchPartners() // Wait for refresh
      
    } catch (error: any) {
      console.error('Error saving partner:', error)
      alert(`Error saving partner: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      category: '',
      featured: false,
      active: true,
      order: 0
    })
    setShowAddPartner(false)
    setEditingPartner(null)
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      description: partner.description || '',
      logo: partner.logo || '',
      website: partner.website || '',
      category: partner.category || '',
      featured: partner.featured,
      active: partner.active,
      order: partner.order
    })
    setShowAddPartner(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner? This action cannot be undone.')) return

    try {
      console.log('Deleting partner:', id)
      const partnerRef = doc(db, 'partners', id)
      await deleteDoc(partnerRef)

      console.log('Partner deleted successfully')
      setPartners(partners.filter(partner => partner.id !== id))
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert('Failed to delete partner. Please try again.')
    }
  }

  const toggleActive = async (partner: Partner) => {
    try {
      const partnerRef = doc(db, 'partners', partner.id)
      await updateDoc(partnerRef, {
        active: !partner.active,
        updatedAt: serverTimestamp()
      })

      setPartners(partners.map(p =>
        p.id === partner.id
          ? { ...p, active: !p.active }
          : p
      ))
    } catch (error) {
      console.error('Error updating partner status:', error)
      alert('Error updating partner. Please try again.')
    }
  }

  const toggleFeatured = async (partner: Partner) => {
    try {
      const partnerRef = doc(db, 'partners', partner.id)
      await updateDoc(partnerRef, {
        featured: !partner.featured,
        updatedAt: serverTimestamp()
      })

      setPartners(partners.map(p =>
        p.id === partner.id
          ? { ...p, featured: !p.featured }
          : p
      ))
    } catch (error) {
      console.error('Error updating partner featured status:', error)
      alert('Error updating partner. Please try again.')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partners Management</h1>
          <p className="text-muted-foreground">Manage partner companies and organizations for your website.</p>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null)
            resetForm()
            setShowAddPartner(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Partners</h3>
          <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Featured</h3>
          <p className="text-2xl font-bold text-purple-600">
            {partners.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
          <p className="text-2xl font-bold text-gray-600">
            {partners.filter(p => !p.active).length}
          </p>
        </div>
      </div>

      {/* Add/Edit Partner Modal */}
      {showAddPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500">
                  Recommended size: 200x100px PNG or JPG
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Brief description about the partner..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Featured</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      {editingPartner ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md border">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Partners</h3>
            <button
              onClick={fetchPartners}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No partners found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding your first partner.
              </p>
              <button
                onClick={() => setShowAddPartner(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Partner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div key={partner.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    {/* Logo and Name */}
                    <div className="flex items-start space-x-3 mb-3">
                      {partner.logo ? (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><PhotoIcon class="h-8 w-8 text-gray-400" /></div>'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{partner.name}</h4>
                          {partner.featured && (
                            <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        {partner.category && (
                          <p className="text-sm text-blue-600 truncate">{partner.category}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {partner.active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Order: {partner.order}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {partner.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {partner.description}
                      </p>
                    )}

                    {/* Website */}
                    {partner.website && (
                      <div className="mb-3">
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <GlobeAltIcon className="h-4 w-4 mr-1" />
                          Visit Website
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                      <div className="text-xs text-gray-500">
                        {formatDate(partner.createdAt)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleFeatured(partner)}
                          className={`p-1.5 rounded-md ${
                            partner.featured
                              ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                          title={partner.featured ? 'Remove featured' : 'Mark as featured'}
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(partner)}
                          className={`p-1.5 rounded-md ${
                            partner.active
                              ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                          title={partner.active ? 'Deactivate' : 'Activate'}
                        >
                          {partner.active ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            <XCircleIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(partner)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}