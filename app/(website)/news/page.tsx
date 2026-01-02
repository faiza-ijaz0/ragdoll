'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  NewspaperIcon, 
  CalendarDaysIcon, 
  UserIcon, 
  ArrowRightIcon, 
  MagnifyingGlassIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

// Firebase imports
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

// Blog type definition
type Blog = {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  readTime: string
  imageUrl: string
  published: boolean
  createdAt: any
  updatedAt: any
  slug: string
  tags: string[]
}

// Function to fetch blogs from Firebase
async function fetchBlogs() {
  try {
    console.log('📝 Fetching blogs from Firebase...')
    const blogsRef = collection(db, 'blogs')
    
    // Fetch only published blogs
    const q = query(
      blogsRef,
      where('published', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    console.log(`✅ Found ${querySnapshot.size} published blogs`)
    
    const blogs: Blog[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      blogs.push({
        id: doc.id,
        title: data.title || 'Untitled Blog',
        excerpt: data.excerpt || '',
        content: data.content || '',
        author: data.author || 'Unknown Author',
        category: data.category || 'Uncategorized',
        readTime: data.readTime || '5 min read',
        imageUrl: data.imageUrl || '/api/placeholder/600/400',
        published: data.published || false,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        slug: data.slug || doc.id,
        tags: data.tags || []
      })
    })
    
    // Sort by creation date (newest first)
    blogs.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    
    return blogs
    
  } catch (error: any) {
    console.error('❌ Error fetching blogs:', error.message)
    return []
  }
}

// Format date function
function formatDate(dateInput: any): string {
  try {
    let date: Date
    
    if (dateInput?.toDate) {
      // Firebase Timestamp
      date = dateInput.toDate()
    } else if (typeof dateInput === 'string') {
      // ISO string
      date = new Date(dateInput)
    } else if (dateInput instanceof Date) {
      // Date object
      date = dateInput
    } else {
      // Fallback to current date
      date = new Date()
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Recent'
  }
}

// Get unique categories from blogs
function getCategoriesFromBlogs(blogs: Blog[]): string[] {
  const categories = blogs.map(blog => blog.category)
  return ['All', ...Array.from(new Set(categories))]
}

export default function NewsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('latest')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch blogs on component mount
  useEffect(() => {
    async function loadBlogs() {
      setLoading(true)
      const fetchedBlogs = await fetchBlogs()
      setBlogs(fetchedBlogs)
      setLoading(false)
    }
    
    loadBlogs()
  }, [])

  // Filter blogs based on category and search
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null
  const regularBlogs = filteredBlogs.slice(1)
  
  // Get categories from blogs
  const categories = getCategoriesFromBlogs(blogs)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-br from-primary/5 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-secondary mb-6 tracking-tight">
              <span className="text-secondary">Real Estate</span> <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-600 max-w-3xl mx-auto">
              Stay informed with the latest Dubai real estate market insights and industry updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                Latest Updates
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all">
                Market Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['latest', 'market-reports', 'developments', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 hover:text-primary'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeTab === 'latest' && (
          <div className="space-y-12">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-secondary'
                        : 'bg-slate-100 text-slate-700 hover:bg-primary hover:text-secondary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Blog */}
            {featuredBlog && (
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div
                      className="h-64 md:h-full bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${featuredBlog.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center mb-4">
                      <span className="px-3 py-1 bg-primary text-secondary rounded-full text-xs font-bold uppercase tracking-widest">
                        Featured
                      </span>
                      <span className="ml-4 text-sm text-slate-500">
                        {featuredBlog.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-secondary mb-4 tracking-tight">
                      {featuredBlog.title}
                    </h2>
                    <p className="mb-6 text-slate-600 leading-relaxed">
                      {featuredBlog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {featuredBlog.author}
                        <span className="mx-2">•</span>
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {formatDate(featuredBlog.createdAt)}
                        <span className="mx-2">•</span>
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {featuredBlog.readTime}
                      </div>
                      <Link
                        href={`/news/${featuredBlog.slug || featuredBlog.id}`}
                        className="flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        Read More
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/news/${blog.slug || blog.id}`}
                  className="block rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg group"
                >
                  <div
                    className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{ 
                      backgroundImage: `url(${blog.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200">
                        {blog.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {blog.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-3 group-hover:text-primary transition-colors leading-tight">
                      {blog.title}
                    </h3>
                    <p className="text-sm mb-4 text-slate-600 leading-relaxed">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{blog.author}</span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Blogs Message */}
            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <NewspaperIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No blogs found</h3>
                <p className="text-slate-500">
                  {searchTerm 
                    ? `No blogs found for "${searchTerm}"`
                    : 'No blogs available at the moment. Please check back soon.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Other Tabs - You can customize these based on categories */}
        {activeTab === 'market-reports' && (
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight text-center mb-12">
              <span className="text-secondary">Market Reports</span> <span className="text-primary">& Analysis</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs
                .filter(blog => blog.category.toLowerCase().includes('market') || blog.category.toLowerCase().includes('report'))
                .map((blog) => (
                <div key={blog.id} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <h3 className="text-xl font-bold text-secondary mb-3 hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mb-4 text-slate-600 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{formatDate(blog.createdAt)}</span>
                    <Link
                      href={`/news/${blog.slug || blog.id}`}
                      className="font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Read Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'developments' && (
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight text-center mb-12">
              <span className="text-secondary">New Developments</span> <span className="text-primary">& Projects</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs
                .filter(blog => blog.category.toLowerCase().includes('development') || blog.category.toLowerCase().includes('project'))
                .map((blog) => (
                <div key={blog.id} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <h3 className="text-xl font-bold text-secondary mb-3 hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mb-4 text-slate-600 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{formatDate(blog.createdAt)}</span>
                    <Link
                      href={`/news/${blog.slug || blog.id}`}
                      className="font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight text-center mb-12">
              <span className="text-secondary">Investment Insights</span> <span className="text-primary">& Trends</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs
                .filter(blog => 
                  blog.category.toLowerCase().includes('investment') || 
                  blog.category.toLowerCase().includes('insight') ||
                  blog.category.toLowerCase().includes('trend')
                )
                .map((blog) => (
                <div key={blog.id} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
                  <h3 className="text-xl font-bold text-secondary mb-3 hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mb-4 text-slate-600 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{formatDate(blog.createdAt)}</span>
                    <Link
                      href={`/news/${blog.slug || blog.id}`}
                      className="font-bold text-primary hover:text-secondary transition-colors"
                    >
                      Read Analysis
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <NewspaperIcon className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight mb-4">
            <span className="text-secondary">Stay Updated</span> <span className="text-primary">with Latest News</span>
          </h2>
          <p className="text-lg mb-8 text-slate-300 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive market insights and property updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-primary/30 bg-slate-800 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button className="px-8 py-3 bg-primary text-secondary font-bold rounded-xl hover:bg-white transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}