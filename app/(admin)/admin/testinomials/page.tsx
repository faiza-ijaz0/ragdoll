
'use client';

import { useState, useEffect } from 'react'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'

interface Testimonial {
  id: string
  name: string
  email: string
  company?: string
  position?: string
  message: string
  rating: number
  approved: boolean
  featured: boolean
  createdAt: any
  updatedAt: any
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTestimonial, setShowAddTestimonial] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    message: '',
    rating: 5,
    approved: true,
    featured: false
  })

  // Fetch testimonials from Firebase
  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      console.log('Fetching testimonials from Firebase...')

      const testimonialsRef = collection(db, 'testimonials')
      const q = query(testimonialsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      const testimonialsData: Testimonial[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        testimonialsData.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          position: data.position || '',
          message: data.message || '',
          rating: data.rating || 5,
          approved: data.approved || false,
          featured: data.featured || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        })
      })

      console.log('Testimonials loaded:', testimonialsData.length)
      setTestimonials(testimonialsData)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      alert('Failed to load testimonials. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Name, email, and message are required')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setIsSubmitting(true)
      
      const testimonialData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company.trim(),
        position: formData.position.trim(),
        message: formData.message.trim(),
        rating: formData.rating,
        approved: formData.approved,
        featured: formData.featured,
        updatedAt: serverTimestamp()
      }

      if (editingTestimonial) {
        // Update existing testimonial
        const testimonialRef = doc(db, 'testimonials', editingTestimonial.id)
        await updateDoc(testimonialRef, {
          ...testimonialData,
          createdAt: editingTestimonial.createdAt || serverTimestamp()
        })
        console.log('Testimonial updated:', editingTestimonial.id)
      } else {
        // Add new testimonial
        const docRef = await addDoc(collection(db, 'testimonials'), {
          ...testimonialData,
          createdAt: serverTimestamp()
        })
        console.log('Testimonial added with ID:', docRef.id)
      }

      // Reset form and refresh list
      resetForm()
      await fetchTestimonials() // Wait for refresh
      
    } catch (error: any) {
      console.error('Error saving testimonial:', error)
      alert(`Error saving testimonial: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      position: '',
      message: '',
      rating: 5,
      approved: true,
      featured: false
    })
    setShowAddTestimonial(false)
    setEditingTestimonial(null)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      email: testimonial.email,
      company: testimonial.company || '',
      position: testimonial.position || '',
      message: testimonial.message,
      rating: testimonial.rating,
      approved: testimonial.approved,
      featured: testimonial.featured
    })
    setShowAddTestimonial(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) return

    try {
      console.log('Deleting testimonial:', id)
      const testimonialRef = doc(db, 'testimonials', id)
      await deleteDoc(testimonialRef)

      console.log('Testimonial deleted successfully')
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id))
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Failed to delete testimonial. Please try again.')
    }
  }

  const toggleApproval = async (testimonial: Testimonial) => {
    try {
      const testimonialRef = doc(db, 'testimonials', testimonial.id)
      await updateDoc(testimonialRef, {
        approved: !testimonial.approved,
        updatedAt: serverTimestamp()
      })

      setTestimonials(testimonials.map(t =>
        t.id === testimonial.id
          ? { ...t, approved: !t.approved }
          : t
      ))
    } catch (error) {
      console.error('Error updating testimonial approval:', error)
      alert('Error updating testimonial. Please try again.')
    }
  }

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const testimonialRef = doc(db, 'testimonials', testimonial.id)
      await updateDoc(testimonialRef, {
        featured: !testimonial.featured,
        updatedAt: serverTimestamp()
      })

      setTestimonials(testimonials.map(t =>
        t.id === testimonial.id
          ? { ...t, featured: !t.featured }
          : t
      ))
    } catch (error) {
      console.error('Error updating testimonial featured status:', error)
      alert('Error updating testimonial. Please try again.')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
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

  // Calculate statistics
  const approvedCount = testimonials.filter(t => t.approved).length
  const featuredCount = testimonials.filter(t => t.featured).length
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground">Manage customer testimonials and reviews for your website.</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null)
            resetForm()
            setShowAddTestimonial(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Testimonials</h3>
          <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Featured</h3>
          <p className="text-2xl font-bold text-purple-600">{featuredCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Avg. Rating</h3>
          <p className="text-2xl font-bold text-yellow-600">{averageRating} ⭐</p>
        </div>
      </div>

      {/* Add/Edit Testimonial Modal */}
      {showAddTestimonial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="ABC Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="CEO"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="approved"
                    checked={formData.approved}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Approved</label>
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
                      {editingTestimonial ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md border">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Testimonials</h3>
            <button
              onClick={fetchTestimonials}
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
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No testimonials found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding your first testimonial.
              </p>
              <button
                onClick={() => setShowAddTestimonial(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Testimonial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    {/* Header with name and rating */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                        {testimonial.company && (
                          <p className="text-sm text-blue-600">{testimonial.company}</p>
                        )}
                        {testimonial.position && (
                          <p className="text-xs text-gray-500">{testimonial.position}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4 flex-1">
                      <p className="text-gray-600 italic">"{testimonial.message}"</p>
                    </div>

                    {/* Footer with actions and status */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {testimonial.approved ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                        {testimonial.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <StarIcon className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {formatDate(testimonial.createdAt)}
                        </span>
                      </div>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => toggleApproval(testimonial)}
                          className={`p-1.5 rounded-md ${
                            testimonial.approved
                              ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              : 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                          }`}
                          title={testimonial.approved ? 'Unapprove' : 'Approve'}
                        >
                          {testimonial.approved ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFeatured(testimonial)}
                          className={`p-1.5 rounded-md ${
                            testimonial.featured
                              ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                          title={testimonial.featured ? 'Remove featured' : 'Mark as featured'}
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
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