'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { 
  QuestionMarkCircleIcon, 
  BuildingOfficeIcon, 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'



const faqCategories = [
  { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon },
  { id: 'general', name: 'General', icon: BuildingOfficeIcon },
  { id: 'services', name: 'Our Services', icon: HomeIcon },
  { id: 'investment', name: 'Investment', icon: SparklesIcon },
  { id: 'legal', name: 'Legal', icon: DocumentTextIcon },
]

const faqs = [
  {
    id: 1,
    category: 'general',
    question: 'What services does RAGDOLL Properties offer?',
    answer: 'We specialize in real estate sales, rentals, and property management in Dubai. Our services include residential and commercial property listings, investment consultations, and full support throughout the buying, selling, or renting process.',
    icon: BuildingOfficeIcon
  },
  {
    id: 2,
    category: 'general',
    question: 'Where is RAGDOLL Properties located?',
    answer: 'Our office is based in Dubai, UAE. You can find our full contact details and location map on our Contact Us page. We serve clients throughout the UAE with a focus on Dubai\'s prime real estate markets.',
    icon: MapPinIcon
  },
  {
    id: 3,
    category: 'services',
    question: 'Do you deal with off-plan properties?',
    answer: 'Yes, we offer a wide range of off-plan properties from leading developers in Dubai, including Emaar, DAMAC, Sobha, and more. Our team provides expert guidance on payment plans, handover timelines, and investment potential.',
    icon: HomeIcon
  },
  {
    id: 4,
    category: 'services',
    question: 'How can I list my property with RAGDOLL Properties?',
    answer: 'You can list your property through our website using the "Submit Property" feature, or contact our team directly via phone or email. We will guide you through the listing and marketing process, including professional photography and virtual tours.',
    icon: DocumentTextIcon
  },
  {
    id: 5,
    category: 'services',
    question: 'Are there any charges for property listing?',
    answer: 'Listing is currently free on our website for property owners. Commission or service charges may apply once a successful transaction is made, depending on the agreement. Contact us for detailed information about our fee structure.',
    icon: QuestionMarkCircleIcon
  },
  {
    id: 6,
    category: 'investment',
    question: 'Do you assist with property management?',
    answer: 'Yes, we provide end-to-end property management services including tenant sourcing, maintenance coordination, rent collection, and legal documentation. Our team ensures your investment is well-maintained and profitable.',
    icon: UsersIcon
  },
  {
    id: 7,
    category: 'investment',
    question: 'What areas in Dubai do you cover?',
    answer: 'We cover all major areas in Dubai including Downtown, Dubai Marina, Palm Jumeirah, Emirates Hills, Arabian Ranches, and emerging communities like Dubai South and Dubai Hills Estate. Our expertise spans the entire Dubai real estate market.',
    icon: MapPinIcon
  },
  {
    id: 8,
    category: 'legal',
    question: 'Can non-residents buy property in Dubai?',
    answer: 'Yes, non-residents can buy property in designated freehold areas in Dubai. We can guide you through the process and help with all legal requirements, including residency visas, registration with DLD, and understanding ownership laws.',
    icon: DocumentTextIcon
  }
]

// Accordion Item Component
const FAQItem = ({ faq, isOpen, onToggle }: { faq: any; isOpen: boolean; onToggle: () => void }) => {
  const Icon = faq.icon
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-8 flex items-start justify-between text-left group"
      >
        <div className="flex items-start gap-6 flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 pr-8">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
              {faq.question}
            </h3>
            <div className={`mt-4 text-slate-600 leading-relaxed ${isOpen ? 'block' : 'hidden'}`}>
              {faq.answer}
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFaqs, setOpenFaqs] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleFaq = (faqId: number) => {
    setOpenFaqs(prev =>
      prev.includes(faqId)
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    )
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <Image 
            src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="FAQ Hero"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-b from-secondary/60 via-secondary/40 to-white"></div>
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-primary font-bold tracking-[0.4em] uppercase text-sm mb-6 animate-slide-up">
            HELP & SUPPORT
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 animate-slide-up [animation-delay:100ms]">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
            Find answers to common questions about our services, Dubai real estate, and property investment.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-12 border-y border-slate-100">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-b border-slate-100">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            {faqCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-8 py-3 rounded-full border font-bold text-sm transition-all flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? 'bg-primary text-secondary border-primary'
                      : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24">
        <div className="container-custom max-w-4xl">
          {filteredFaqs.length > 0 ? (
            <div className="bg-white rounded-[3rem] border border-slate-200 divide-y divide-slate-200 shadow-xl">
              {filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqs.includes(faq.id)}
                  onToggle={() => toggleFaq(faq.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-[3rem]">
              <QuestionMarkCircleIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <QuestionMarkCircleIcon className="w-16 h-16 text-secondary mx-auto mb-8" />
              <h2 className="text-4xl md:text-6xl font-black text-secondary mb-8 tracking-tight">
                Still Have <span className="text-white">Questions?</span>
              </h2>
              <p className="text-xl text-secondary/80 mb-12 font-medium">
                Can't find the answer you're looking for? Please chat with our friendly team or visit our contact page.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-secondary transition-all"
                >
                  Contact Us
                </Link>
                <Link 
                  href="tel:+97141234567" 
                  className="px-10 py-5 bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-secondary transition-all border border-white/30"
                >
                  Call Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Call Us</p>
                <p className="text-lg font-bold text-slate-900">+971 4 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Email</p>
                <p className="text-lg font-bold text-slate-900">info@ragdollproperties.ae</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Location</p>
                <p className="text-lg font-bold text-slate-900">Dubai, UAE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-white/60">© 2024 RAGDOLL Properties. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}