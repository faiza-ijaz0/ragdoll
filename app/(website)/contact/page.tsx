'use client'

import { useState } from 'react'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, SparklesIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { getTopAgents } from '@/lib/mock-data'
import AgentListClient from '@/components/agent/AgentListClient'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // ✅ Firebase form submission function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      // ✅ Save to Firebase Firestore - request_information collection
      const docRef = await addDoc(collection(db, 'request_information'), {
        // Basic contact info
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || 'Not provided',
        subject: formData.subject || 'General Inquiry',
        
        // Message content
        message: formData.message.trim(),
        
        // Metadata
        type: 'private_inquiry',
        status: 'pending',
        source: 'contact_page',
        
        // Timestamps
        createdAt: serverTimestamp(),
        submittedAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Inquiry saved with ID:', docRef.id)
      
      // Reset form and show success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      setSubmitted(true)
      
    } catch (error) {
      console.error('❌ Error submitting inquiry:', error)
      setSubmitError('Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Direct Line',
      details: ['+971 50 123 4567', '+971 55 765 4321'],
      description: 'Available 24/7 for VIP clients'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Inquiry',
      details: ['concierge@RAGDOLL.com', 'invest@RAGDOLL.com'],
      description: 'Priority response within 2 hours'
    },
    {
      icon: MapPinIcon,
      title: 'Global Headquarters',
      details: ['Level 45, Burj Daman', 'DIFC, Dubai, UAE'],
      description: 'Private consultations by appointment'
    },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200 p-12 border border-slate-100">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <PaperAirplaneIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-serif text-secondary mb-4">Inquiry Received</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Thank you for reaching out to RAGDOLLL. One of our senior property advisors will contact you shortly to discuss your requirements.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-secondary hover:bg-primary text-white hover:text-secondary font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-secondary/20"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <Image 
            src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Dubai Contact"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-b from-secondary/60 via-secondary/40 to-white"></div>
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <span className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm font-bold tracking-widest uppercase rounded-full mb-6">
            Get In Touch
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
            Connect with <span className="text-primary italic">Excellence</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you're looking to invest, sell, or find your dream home, our elite team is here to provide bespoke guidance.
          </p>
        </div>
      </section>
   
      <section className="py-24 -mt-24 relative z-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-primary/30 transition-all duration-500">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <info.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif text-secondary mb-4">{info.title}</h3>
                  <div className="space-y-2 mb-4">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-slate-600 font-medium">{detail}</p>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 italic">{info.description}</p>
                </div>
              ))}

              {/* Social/Live Chat Card */}
              
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="flex items-center gap-3 mb-10">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-serif text-secondary">Send a Private Inquiry</h2>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-600 text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+971 50 000 0000"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">
                        Inquiry Type
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all text-slate-600"
                      >
                        <option value="">Select Interest</option>
                        <option value="buying">Buying Property</option>
                        <option value="selling">Selling Property</option>
                        <option value="investment">Investment Advice</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Tell us about your property requirements..."
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-300 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-secondary text-white font-bold rounded-2xl hover:bg-primary hover:text-secondary transition-all duration-500 shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5" />
                        Submit Inquiry
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-slate-500 text-center">
                    By submitting this form, you agree to our privacy policy. One of our agents will contact you within 24 hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-secondary mb-4">
              Visit Our <span className="text-primary">Premium Office</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our office is located in the heart of Dubai International Financial Centre (DIFC), 
              providing easy access to all major business districts and residential areas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Office Information */}
            <div className="space-y-8">
              {/* Office Card */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-1">Our Office Location</h3>
                    <p className="text-slate-500">Premium DIFC Location</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-semibold text-secondary">Burj Daman, Level 45</p>
                      <p className="text-slate-600">DIFC, Dubai, United Arab Emirates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-secondary">Contact Number</p>
                      <p className="text-slate-600">+971 4 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-semibold text-secondary">Business Hours</p>
                      <p className="text-slate-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                      <p className="text-slate-600">Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-secondary">Email Address</p>
                      <p className="text-slate-600">info@realestate-dubai.com</p>
                    </div>
                  </div>
                </div>
                
                {/* Get Directions Button */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <a 
                    href="https://maps.google.com/?q=Burj+Daman+Level+45+DIFC+Dubai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    Get Directions on Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Google Maps */}
            <div>
              <div className="bg-slate-100 rounded-[2.5rem] h-[500px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative">
                <div className="w-full h-full">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.966634416174!2d55.26822837649556!3d25.208017977686725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f42e9b4b5a6c1%3A0x50a6b6c0c0b6c0c0!2sBurj%20Daman!5e0!3m2!1sen!2sae!4v1696941234567!5m2!1sen!2sae`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="RAGDOLLL Real Estate Office Location"
                    className="rounded-[2.5rem]"
                  ></iframe>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl animate-pulse">
                          <MapPinIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-red-500 rotate-45"></div>
                      </div>

                      <div className="mt-4 bg-white rounded-2xl p-4 shadow-2xl max-w-xs">
                        <div className="font-bold text-slate-900 text-lg mb-1">
                          RAGDOLLL Real Estate Office
                        </div>
                        <div className="text-slate-600 text-sm">
                          Burj Daman, Level 45, DIFC, Dubai
                        </div>
                        <div className="text-slate-500 text-xs mt-1">
                          Lat: 25.2080, Lng: 55.2708
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    Exact Location
                  </h3>
                  <p className="text-slate-700 text-lg">
                    Burj Daman, Level 45, DIFC, Dubai, United Arab Emirates
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Coordinates: 25.2080, 55.2708
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-primary mb-1">1 min</div>
                  <div className="text-sm text-slate-600">to DIFC Metro</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-primary mb-1">5 min</div>
                  <div className="text-sm text-slate-600">to Downtown Dubai</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-primary mb-1">10 min</div>
                  <div className="text-sm text-slate-600">to Dubai Mall</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl font-bold text-primary mb-1">15 min</div>
                  <div className="text-sm text-slate-600">to Dubai Marina</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}