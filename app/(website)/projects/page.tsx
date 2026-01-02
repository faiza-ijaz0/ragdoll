// "use client"

// import Image from 'next/image'
// import { Suspense, useState, useEffect } from 'react'
// import {
//   BuildingOfficeIcon,
//   MapPinIcon,
//   CurrencyDollarIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   WrenchScrewdriverIcon,
//   XMarkIcon,
//   EnvelopeIcon,
//   PhoneIcon,
//   UserIcon,
//   SparklesIcon,
//   ArrowRightIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   FunnelIcon,
//   HomeIcon,
//   ShoppingBagIcon,
//   ArrowTrendingUpIcon,
//   EyeIcon,
//   VideoCameraIcon,
//   DocumentTextIcon,
//   HomeModernIcon,
//   BuildingLibraryIcon,
//   IdentificationIcon,
//   TagIcon,
//   ArrowUpRightIcon,
//   ArrowsPointingOutIcon
// } from '@heroicons/react/24/outline'
// import { db } from '@/lib/firebase'
// import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'

// // Types define karen
// interface Project {
//   id: string;
//   name: string;
//   developer?: string;
//   developer_id?: string | null;
//   status: string;
//   launch_date: string;
//   completion_date: string;
//   city: string;
//   area: string;
//   starting_price: number;
//   currency: string;
//   total_units: number;
//   available_units: number;
//   property_types: string[];
//   hero_image_url: string;
//   images: string[];
//   description: string;
//   payment_plan?: string | null;
//   amenities?: string[];
//   facilities?: string[];
//   min_price: number;
//   max_price: number;
//   sold_units: number;
//   brochure_url?: string;
//   video_url?: string;
//   featured: boolean;
//   published: boolean;
//   // Additional fields from your Firebase
//   address?: string;
//   district?: string;
//   payment_terms?: string | null;
//   video_url?: string;
//   seo_title?: string | null;
//   seo_description?: string | null;
//   seo_keywords?: string[];
//   handover_date?: string;
//   enquiries_count?: number;
//   views_count?: number;
// }

// const developers = [
//   { id: 'all', name: 'All Developers', count: 0 },
//   { id: 'emaar', name: 'Emaar Properties', count: 0 },
//   { id: 'damac', name: 'DAMAC Properties', count: 0 },
//   { id: 'nakheel', name: 'Nakheel Properties', count: 0 }
// ]

// function ProjectsPageContent() {
//   const [projects, setProjects] = useState<Project[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedDeveloper, setSelectedDeveloper] = useState('all')
//   const [inquiryModal, setInquiryModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null })
//   const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null })
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     message: ''
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [submitSuccess, setSubmitSuccess] = useState(false)
//   const [selectedImageIndex, setSelectedImageIndex] = useState<{[key: string]: number}>({})
//   const [currentVideoPlaying, setCurrentVideoPlaying] = useState<string | null>(null)

//   // Firebase se data fetch karna
//   useEffect(() => {
//     fetchProjects()
//   }, [])

//   const fetchProjects = async () => {
//     try {
//       setLoading(true)
//       const projectsRef = collection(db, 'projects')
//       const q = query(projectsRef, where('published', '==', true))
//       const querySnapshot = await getDocs(q)
      
//       const projectsData: Project[] = []
//       querySnapshot.forEach((doc) => {
//         const data = doc.data()
//         projectsData.push({
//           id: doc.id,
//           name: data.name || '',
//           developer: data.developer || '',
//           developer_id: data.developer_id || null,
//           status: data.status || 'in-progress',
//           launch_date: data.launch_date || '',
//           completion_date: data.completion_date || '',
//           city: data.city || '',
//           area: data.area || '',
//           address: data.address || '',
//           district: data.district || '',
//           starting_price: data.starting_price || 0,
//           currency: data.currency || 'AED',
//           total_units: data.total_units || 0,
//           available_units: data.available_units || 0,
//           property_types: data.property_types || [],
//           hero_image_url: data.hero_image_url || '/default-image.jpg',
//           images: data.images || [],
//           description: data.description || '',
//           payment_plan: data.payment_plan || null,
//           payment_terms: data.payment_terms || null,
//           amenities: data.amenities || [],
//           facilities: data.facilities || [],
//           min_price: data.min_price || 0,
//           max_price: data.max_price || 0,
//           sold_units: data.sold_units || 0,
//           brochure_url: data.brochure_url || '',
//           video_url: data.video_url || '',
//           featured: data.featured || false,
//           published: data.published || false,
//           handover_date: data.handover_date || '',
//           enquiries_count: data.enquiries_count || 0,
//           views_count: data.views_count || 0,
//           seo_title: data.seo_title || null,
//           seo_description: data.seo_description || null,
//           seo_keywords: data.seo_keywords || []
//         })
//       })
      
//       setProjects(projectsData)
      
//       // Developer counts update karen
//       updateDeveloperCounts(projectsData)
      
//     } catch (error) {
//       console.error('Error fetching projects:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateDeveloperCounts = (projectsData: Project[]) => {
//     const emaarCount = projectsData.filter(p => p.developer === 'Emaar Properties' || p.developer?.toLowerCase().includes('emaar')).length
//     const damacCount = projectsData.filter(p => p.developer === 'DAMAC Properties' || p.developer?.toLowerCase().includes('damac')).length
//     const nakheelCount = projectsData.filter(p => p.developer === 'Nakheel Properties' || p.developer?.toLowerCase().includes('nakheel')).length
    
//     developers[0].count = projectsData.length
//     developers[1].count = emaarCount
//     developers[2].count = damacCount
//     developers[3].count = nakheelCount
//   }

//   const handleViewDetails = async (projectId: string) => {
//     try {
//       // Fetch complete project details from Firebase
//       const projectDoc = doc(db, 'projects', projectId)
//       const projectSnapshot = await getDoc(projectDoc)
      
//       if (projectSnapshot.exists()) {
//         const data = projectSnapshot.data()
//         const projectDetails: Project = {
//           id: projectSnapshot.id,
//           name: data.name || '',
//           developer: data.developer || '',
//           developer_id: data.developer_id || null,
//           status: data.status || 'in-progress',
//           launch_date: data.launch_date || '',
//           completion_date: data.completion_date || '',
//           city: data.city || '',
//           area: data.area || '',
//           address: data.address || '',
//           district: data.district || '',
//           starting_price: data.starting_price || 0,
//           currency: data.currency || 'AED',
//           total_units: data.total_units || 0,
//           available_units: data.available_units || 0,
//           property_types: data.property_types || [],
//           hero_image_url: data.hero_image_url || '/default-image.jpg',
//           images: data.images || [],
//           description: data.description || '',
//           payment_plan: data.payment_plan || null,
//           payment_terms: data.payment_terms || null,
//           amenities: data.amenities || [],
//           facilities: data.facilities || [],
//           min_price: data.min_price || 0,
//           max_price: data.max_price || 0,
//           sold_units: data.sold_units || 0,
//           brochure_url: data.brochure_url || '',
//           video_url: data.video_url || '',
//           featured: data.featured || false,
//           published: data.published || false,
//           handover_date: data.handover_date || '',
//           enquiries_count: data.enquiries_count || 0,
//           views_count: data.views_count || 0,
//           seo_title: data.seo_title || null,
//           seo_description: data.seo_description || null,
//           seo_keywords: data.seo_keywords || []
//         }
        
//         setDetailsModal({ isOpen: true, project: projectDetails })
//       }
//     } catch (error) {
//       console.error('Error fetching project details:', error)
//     }
//   }

//   const filteredProjects = selectedDeveloper === 'all' 
//     ? projects 
//     : projects.filter(project => {
//         if (selectedDeveloper === 'emaar') {
//           return project.developer?.toLowerCase().includes('emaar')
//         } else if (selectedDeveloper === 'damac') {
//           return project.developer?.toLowerCase().includes('damac')
//         } else if (selectedDeveloper === 'nakheel') {
//           return project.developer?.toLowerCase().includes('nakheel')
//         }
//         return false
//       })

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)
    
//     // Simulate form submission
//     await new Promise(resolve => setTimeout(resolve, 2000))
    
//     setSubmitSuccess(true)
//     setIsSubmitting(false)
    
//     // Reset form after 3 seconds
//     setTimeout(() => {
//       setSubmitSuccess(false)
//       setInquiryModal({ isOpen: false, project: null })
//       setFormData({ name: '', email: '', phone: '', message: '' })
//     }, 3000)
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }))
//   }

//   const handleImageChange = (projectId: string, direction: 'next' | 'prev') => {
//     const currentIndex = selectedImageIndex[projectId] || 0
//     const project = projects.find(p => p.id === projectId)
//     if (!project || !project.images || project.images.length === 0) return

//     const maxIndex = project.images.length - 1
//     let newIndex

//     if (direction === 'next') {
//       newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
//     } else {
//       newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1
//     }

//     setSelectedImageIndex(prev => ({
//       ...prev,
//       [projectId]: newIndex
//     }))
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Hero Section */}
//       <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
//         <div className="absolute inset-0">
//           <Image 
//             src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
//             alt="Dubai Projects"
//             fill
//             className="object-cover opacity-30"
//           />
//           <div className="absolute inset-0 bg-linear-to-b from-secondary/60 via-secondary/40 to-white"></div>
//         </div>
        
//         <div className="container-custom relative z-10 text-center">
//           <span className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm font-bold tracking-widest uppercase rounded-full mb-6">
//             Iconic Developments
//           </span>
//           <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
//             masterpiece <span className="text-primary italic">Projects</span>
//           </h1>
//           <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
//             Discover Dubai's most ambitious architectural marvels and high-yield investment opportunities in off-plan properties.
//           </p>
//         </div>
//       </section>

//       {/* Projects Grid */}
//       <section className="py-24">
//         <div className="container-custom">
//           <div className="mb-12 text-center">
//             <h2 className="text-4xl font-serif text-secondary mb-4">
//               Featured {selectedDeveloper === 'all' ? 'Projects' : developers.find(d => d.id === selectedDeveloper)?.name}
//             </h2>
//             <p className="text-xl text-slate-600 max-w-2xl mx-auto">
//               {selectedDeveloper === 'all' 
//                 ? 'Explore our curated selection of premium off-plan properties from Dubai\'s leading developers'
//                 : `Discover exceptional properties from ${developers.find(d => d.id === selectedDeveloper)?.name}`
//               }
//             </p>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : filteredProjects.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
//                 <BuildingOfficeIcon className="h-12 w-12 text-slate-400" />
//               </div>
//               <h3 className="text-2xl text-slate-400 mb-2">No projects found</h3>
//               <p className="text-slate-500">Try selecting a different developer filter</p>
//             </div>
//           ) : (
//             <div className="grid gap-12">
//               {filteredProjects.map((project) => (
//                 <div 
//                   key={project.id}
//                   className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 group flex flex-col lg:flex-row hover:shadow-primary/10 transition-shadow duration-500"
//                 >
//                   {/* Image Section */}
//                   <div className="lg:w-2/5 relative h-[400px] lg:h-auto overflow-hidden">
//                     <Image 
//                       src={project.hero_image_url || '/default-image.jpg'}
//                       alt={project.name}
//                       fill
//                       className="object-cover group-hover:scale-110 transition-transform duration-1000"
//                       onError={(e) => {
//                         const target = e.target as HTMLImageElement
//                         target.src = '/default-image.jpg'
//                       }}
//                     />
                    
//                     {/* Image Navigation */}
//                     {project.images && project.images.length > 1 && (
//                       <>
//                         <button 
//                           onClick={() => handleImageChange(project.id, 'prev')}
//                           className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all opacity-0 group-hover:opacity-100"
//                         >
//                           <ChevronLeftIcon className="h-5 w-5" />
//                         </button>
//                         <button 
//                           onClick={() => handleImageChange(project.id, 'next')}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all opacity-0 group-hover:opacity-100"
//                         >
//                           <ChevronRightIcon className="h-5 w-5" />
//                         </button>
                        
//                         {/* Image Indicators */}
//                         <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           {project.images.map((_, index) => (
//                             <button
//                               key={index}
//                               onClick={() => setSelectedImageIndex(prev => ({ ...prev, [project.id]: index }))}
//                               className={`w-2 h-2 rounded-full transition-all ${
//                                 (selectedImageIndex[project.id] || 0) === index ? 'bg-white' : 'bg-white/50'
//                               }`}
//                             />
//                           ))}
//                         </div>
//                       </>
//                     )}
                    
//                     <div className="absolute top-6 left-6">
//                       <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${
//                         project.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-primary text-secondary'
//                       }`}>
//                         {project.status === 'completed' ? 'Completed' : 'In Progress'}
//                       </span>
//                     </div>
                    
//                     {/* View Details Button - Yeh main add kiya hun */}
//                     <div className="absolute bottom-6 left-6">
//                       <button
//                         onClick={() => handleViewDetails(project.id)}
//                         className="px-6 py-3 bg-primary text-secondary font-bold rounded-full flex items-center gap-2 hover:bg-secondary hover:text-white transition-all shadow-lg hover:shadow-xl"
//                       >
//                         <EyeIcon className="h-5 w-5" />
//                         View Details
//                       </button>
//                     </div>
//                   </div>

//                   {/* Content Section */}
//                   <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
//                     <div className="flex items-center gap-2 text-primary mb-4">
//                       <SparklesIcon className="h-5 w-5" />
//                       <span className="text-sm font-bold uppercase tracking-widest">{project.developer || 'Developer'}</span>
//                     </div>
                    
//                     <h3 className="text-4xl font-serif text-secondary mb-6 group-hover:text-primary transition-colors">
//                       {project.name}
//                     </h3>
                    
//                     <p className="text-slate-500 mb-8 leading-relaxed text-lg">
//                       {project.description}
//                     </p>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//                       <div className="space-y-1">
//                         <div className="text-xs text-slate-400 uppercase tracking-widest">Location</div>
//                         <div className="text-secondary font-bold flex items-center gap-1">
//                           <MapPinIcon className="h-4 w-4 text-primary" />
//                           {project.area || project.city}
//                         </div>
//                       </div>
                      
//                       <div className="space-y-1">
//                         <div className="text-xs text-slate-400 uppercase tracking-widest">Completion</div>
//                         <div className="text-secondary font-bold flex items-center gap-1">
//                           <CalendarIcon className="h-4 w-4 text-primary" />
//                           {project.completion_date ? new Date(project.completion_date).getFullYear() : 'TBA'}
//                         </div>
//                       </div>
                      
//                       <div className="space-y-1">
//                         <div className="text-xs text-slate-400 uppercase tracking-widest">Available Units</div>
//                         <div className="text-secondary font-bold text-sm">
//                           {project.available_units} / {project.total_units}
//                         </div>
//                       </div>
                      
//                       <div className="space-y-1">
//                         <div className="text-xs text-slate-400 uppercase tracking-widest">Price Range</div>
//                         <div className="text-secondary font-bold text-sm">
//                           {project.currency} {project.min_price ? `${project.min_price}K` : 'N/A'} - {project.max_price ? `${project.max_price}K` : 'N/A'}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Amenities/Facilities show karen */}
//                     <div className="mb-8">
//                       <div className="text-xs text-slate-400 uppercase tracking-widest mb-3">Amenities & Features</div>
//                       <div className="flex flex-wrap gap-2">
//                         {project.amenities && project.amenities.length > 0 ? (
//                           project.amenities.slice(0, 4).map((amenity, index) => (
//                             <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
//                               {amenity}
//                             </span>
//                           ))
//                         ) : project.facilities && project.facilities.length > 0 ? (
//                           project.facilities.slice(0, 4).map((facility, index) => (
//                             <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
//                               {facility}
//                             </span>
//                           ))
//                         ) : project.property_types && project.property_types.length > 0 ? (
//                           project.property_types.slice(0, 4).map((type, index) => (
//                             <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
//                               {type}
//                             </span>
//                           ))
//                         ) : (
//                           <span className="px-3 py-1 bg-slate-100 text-slate-500 text-sm rounded-full">
//                             Features coming soon
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-4">
//                       <button
//                         onClick={() => handleViewDetails(project.id)}
//                         className="px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all flex items-center gap-2"
//                       >
//                         <ArrowsPointingOutIcon className="h-5 w-5" />
//                         View Full Details
//                       </button>
                      
//                       <button
//                         onClick={() => setInquiryModal({ isOpen: true, project: project })}
//                         className="px-8 py-3 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all"
//                       >
//                         Request Info
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Project Details Modal - Yeh main add kiya hun */}
//       {detailsModal.isOpen && detailsModal.project && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/90 backdrop-blur-lg overflow-y-auto ">
//           <div className="bg-white w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn my-8 mt-40">
//             {/* Modal Header with Close Button */}
//             <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-10 py-6 flex justify-between items-center">
//               <h2 className="text-3xl font-serif text-secondary">
//                 {detailsModal.project.name} - Complete Details
//               </h2>
//               <button 
//                 onClick={() => setDetailsModal({ isOpen: false, project: null })}
//                 className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
//               >
//                 <XMarkIcon className="h-6 w-6" />
//               </button>
//             </div>

//             <div className="max-h-[80vh] overflow-y-auto">
//               {/* Hero Image and Basic Info */}
//               <div className="relative h-96">
//                 <Image 
//                   src={detailsModal.project.hero_image_url || '/default-image.jpg'}
//                   alt={detailsModal.project.name}
//                   fill
//                   className="object-cover"
//                   onError={(e) => {
//                     const target = e.target as HTMLImageElement
//                     target.src = '/default-image.jpg'
//                   }}
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent flex items-end">
//                   <div className="p-10 text-white">
//                     <h3 className="text-4xl font-serif mb-2">{detailsModal.project.name}</h3>
//                     <p className="text-xl opacity-90">{detailsModal.project.developer}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
//                 {/* Left Column - Basic Information */}
//                 <div className="lg:col-span-2 space-y-8">
//                   {/* Project Description */}
//                   <div>
//                     <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
//                       <DocumentTextIcon className="h-6 w-6 text-primary" />
//                       Project Description
//                     </h3>
//                     <p className="text-slate-600 leading-relaxed text-lg">
//                       {detailsModal.project.description}
//                     </p>
//                   </div>

//                   {/* Key Features Grid */}
//                   <div>
//                     <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
//                       <HomeModernIcon className="h-6 w-6 text-primary" />
//                       Key Features
//                     </h3>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Project Status</div>
//                         <div className="text-lg font-bold text-secondary">{detailsModal.project.status}</div>
//                       </div>
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Total Units</div>
//                         <div className="text-lg font-bold text-secondary">{detailsModal.project.total_units}</div>
//                       </div>
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Available Units</div>
//                         <div className="text-lg font-bold text-secondary">{detailsModal.project.available_units}</div>
//                       </div>
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Sold Units</div>
//                         <div className="text-lg font-bold text-secondary">{detailsModal.project.sold_units}</div>
//                       </div>
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Price Range</div>
//                         <div className="text-lg font-bold text-secondary">
//                           {detailsModal.project.currency} {detailsModal.project.min_price}K - {detailsModal.project.max_price}K
//                         </div>
//                       </div>
//                       <div className="bg-slate-50 p-4 rounded-xl">
//                         <div className="text-sm text-slate-400">Starting Price</div>
//                         <div className="text-lg font-bold text-secondary">
//                           {detailsModal.project.currency} {detailsModal.project.starting_price}K
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Video Section */}
//                   {detailsModal.project.video_url && (
//                     <div>
//                       <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
//                         <VideoCameraIcon className="h-6 w-6 text-primary" />
//                         Project Video
//                       </h3>
//                       <div className="rounded-2xl overflow-hidden bg-black">
//                         <video 
//                           src={detailsModal.project.video_url}
//                           controls
//                           className="w-full h-[400px]"
//                           onPlay={() => setCurrentVideoPlaying(detailsModal.project?.id || null)}
//                           onPause={() => setCurrentVideoPlaying(null)}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* Images Gallery */}
//                   {detailsModal.project.images && detailsModal.project.images.length > 0 && (
//                     <div>
//                       <h3 className="text-2xl font-serif text-secondary mb-4">Project Gallery</h3>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                         {detailsModal.project.images.map((image, index) => (
//                           <div key={index} className="relative h-48 rounded-xl overflow-hidden">
//                             <Image
//                               src={image}
//                               alt={`${detailsModal.project?.name} - Image ${index + 1}`}
//                               fill
//                               className="object-cover hover:scale-110 transition-transform duration-500"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Right Column - Details Card */}
//                 <div className="space-y-8">
//                   {/* Project Timeline Card */}
//                   <div className="bg-secondary text-white p-6 rounded-2xl">
//                     <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
//                       <CalendarIcon className="h-5 w-5" />
//                       Project Timeline
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex justify-between items-center pb-3 border-b border-white/20">
//                         <span>Launch Date</span>
//                         <span className="font-bold">
//                           {detailsModal.project.launch_date ? new Date(detailsModal.project.launch_date).toLocaleDateString() : 'TBA'}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center pb-3 border-b border-white/20">
//                         <span>Completion Date</span>
//                         <span className="font-bold">
//                           {detailsModal.project.completion_date ? new Date(detailsModal.project.completion_date).toLocaleDateString() : 'TBA'}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center pb-3 border-b border-white/20">
//                         <span>Handover Date</span>
//                         <span className="font-bold">
//                           {detailsModal.project.handover_date ? new Date(detailsModal.project.handover_date).toLocaleDateString() : 'TBA'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Location Details Card */}
//                   <div className="border border-slate-200 p-6 rounded-2xl">
//                     <h3 className="text-xl font-serif text-secondary mb-6 flex items-center gap-2">
//                       <MapPinIcon className="h-5 w-5 text-primary" />
//                       Location Details
//                     </h3>
//                     <div className="space-y-3">
//                       <div className="flex items-start gap-3">
//                         <IdentificationIcon className="h-5 w-5 text-primary mt-1" />
//                         <div>
//                           <div className="text-sm text-slate-400">Address</div>
//                           <div className="font-medium">{detailsModal.project.address || 'N/A'}</div>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-3">
//                         <BuildingLibraryIcon className="h-5 w-5 text-primary mt-1" />
//                         <div>
//                           <div className="text-sm text-slate-400">City</div>
//                           <div className="font-medium">{detailsModal.project.city}</div>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-3">
//                         <TagIcon className="h-5 w-5 text-primary mt-1" />
//                         <div>
//                           <div className="text-sm text-slate-400">Area/District</div>
//                           <div className="font-medium">{detailsModal.project.area} {detailsModal.project.district ? `- ${detailsModal.project.district}` : ''}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Amenities Card */}
//                   {detailsModal.project.amenities && detailsModal.project.amenities.length > 0 && (
//                     <div className="border border-slate-200 p-6 rounded-2xl">
//                       <h3 className="text-xl font-serif text-secondary mb-4">Amenities</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {detailsModal.project.amenities.map((amenity, index) => (
//                           <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full">
//                             {amenity}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Property Types */}
//                   {detailsModal.project.property_types && detailsModal.project.property_types.length > 0 && (
//                     <div className="border border-slate-200 p-6 rounded-2xl">
//                       <h3 className="text-xl font-serif text-secondary mb-4">Property Types</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {detailsModal.project.property_types.map((type, index) => (
//                           <span key={index} className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm rounded-full font-medium">
//                             {type}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   <div className="space-y-3">
                   
                    
//                     {detailsModal.project.brochure_url && (
//                       <a
//                         href={detailsModal.project.brochure_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="w-full py-4 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2"
//                       >
//                         <DocumentTextIcon className="h-5 w-5" />
//                         Download Brochure
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Existing Inquiry Modal */}
//       {inquiryModal.isOpen && inquiryModal.project && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
//             <div className="relative h-48">
//               <Image 
//                 src={inquiryModal.project.hero_image_url || '/default-image.jpg'}
//                 alt={inquiryModal.project.name}
//                 fill
//                 className="object-cover"
//                 onError={(e) => {
//                   const target = e.target as HTMLImageElement
//                   target.src = '/default-image.jpg'
//                 }}
//               />
//               <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center">
//                 <h3 className="text-3xl font-serif text-white">Inquire: {inquiryModal.project.name}</h3>
//               </div>
//               <button 
//                 onClick={() => setInquiryModal({ isOpen: false, project: null })}
//                 className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all"
//               >
//                 <XMarkIcon className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="p-10">
//               {submitSuccess ? (
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-secondary mb-2">Inquiry Sent Successfully!</h3>
//                   <p className="text-slate-600">We'll get back to you within 24 hours with detailed information about {inquiryModal.project.name}.</p>
//                 </div>
//               ) : (
//                 <form onSubmit={handleFormSubmit} className="space-y-6">
//                   <div className="grid md:grid-cols-2 gap-6">
//                     <input 
//                       type="text" 
//                       name="name"
//                       placeholder="Full Name" 
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
//                     />
//                     <input 
//                       type="email" 
//                       name="email"
//                       placeholder="Email Address" 
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
//                     />
//                   </div>
//                   <input 
//                     type="tel" 
//                     name="phone"
//                     placeholder="Phone Number" 
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
//                   />
//                   <textarea 
//                     name="message"
//                     placeholder="Your Message" 
//                     rows={4} 
//                     value={formData.message}
//                     onChange={handleInputChange}
//                     className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 resize-none"
//                   ></textarea>
//                   <button 
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="w-full py-5 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
//                   </button>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function ProjectsPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
//       <ProjectsPageContent />
//     </Suspense>
//   )
// }

// new code
"use client"

import Image from 'next/image'
import { Suspense, useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  HomeModernIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
  TagIcon,
  ArrowUpRightIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'

// Types define karen
interface Project {
  id: string;
  name: string;
  developer?: string;
  developer_id?: string | null;
  status: string;
  launch_date: string;
  completion_date: string;
  city: string;
  area: string;
  starting_price: number;
  currency: string;
  total_units: number;
  available_units: number;
  property_types: string[];
  hero_image_url: string;
  images: string[];
  description: string;
  payment_plan?: string | null;
  amenities?: string[];
  facilities?: string[];
  min_price: number;
  max_price: number;
  sold_units: number;
  brochure_url?: string;
  video_url?: string;
  featured: boolean;
  published: boolean;
  address?: string;
  district?: string;
  payment_terms?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[];
  handover_date?: string;
  enquiries_count?: number;
  views_count?: number;
}

const developers = [
  { id: 'all', name: 'All Developers', count: 0 },
  { id: 'emaar', name: 'Emaar Properties', count: 0 },
  { id: 'damac', name: 'DAMAC Properties', count: 0 },
  { id: 'nakheel', name: 'Nakheel Properties', count: 0 }
]

function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeveloper, setSelectedDeveloper] = useState('all')
  const [inquiryModal, setInquiryModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null })
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<{[key: string]: number}>({})

  // Firebase se data fetch karna
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const projectsRef = collection(db, 'projects')
      const q = query(projectsRef, where('published', '==', true))
      const querySnapshot = await getDocs(q)
      
      const projectsData: Project[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        projectsData.push({
          id: doc.id,
          name: data.name || '',
          developer: data.developer || '',
          developer_id: data.developer_id || null,
          status: data.status || 'in-progress',
          launch_date: data.launch_date || '',
          completion_date: data.completion_date || '',
          city: data.city || '',
          area: data.area || '',
          address: data.address || '',
          district: data.district || '',
          starting_price: data.starting_price || 0,
          currency: data.currency || 'AED',
          total_units: data.total_units || 0,
          available_units: data.available_units || 0,
          property_types: data.property_types || [],
          hero_image_url: data.hero_image_url || '/default-image.jpg',
          images: data.images || [],
          description: data.description || '',
          payment_plan: data.payment_plan || null,
          payment_terms: data.payment_terms || null,
          amenities: data.amenities || [],
          facilities: data.facilities || [],
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
          sold_units: data.sold_units || 0,
          brochure_url: data.brochure_url || '',
          video_url: data.video_url || '',
          featured: data.featured || false,
          published: data.published || false,
          handover_date: data.handover_date || '',
          enquiries_count: data.enquiries_count || 0,
          views_count: data.views_count || 0,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          seo_keywords: data.seo_keywords || []
        })
      })
      
      setProjects(projectsData)
      
      // Developer counts update karen
      updateDeveloperCounts(projectsData)
      
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDeveloperCounts = (projectsData: Project[]) => {
    const emaarCount = projectsData.filter(p => p.developer === 'Emaar Properties' || p.developer?.toLowerCase().includes('emaar')).length
    const damacCount = projectsData.filter(p => p.developer === 'DAMAC Properties' || p.developer?.toLowerCase().includes('damac')).length
    const nakheelCount = projectsData.filter(p => p.developer === 'Nakheel Properties' || p.developer?.toLowerCase().includes('nakheel')).length
    
    developers[0].count = projectsData.length
    developers[1].count = emaarCount
    developers[2].count = damacCount
    developers[3].count = nakheelCount
  }

  const handleViewDetails = async (projectId: string) => {
    try {
      // Fetch complete project details from Firebase
      const projectDoc = doc(db, 'projects', projectId)
      const projectSnapshot = await getDoc(projectDoc)
      
      if (projectSnapshot.exists()) {
        const data = projectSnapshot.data()
        const projectDetails: Project = {
          id: projectSnapshot.id,
          name: data.name || '',
          developer: data.developer || '',
          developer_id: data.developer_id || null,
          status: data.status || 'in-progress',
          launch_date: data.launch_date || '',
          completion_date: data.completion_date || '',
          city: data.city || '',
          area: data.area || '',
          address: data.address || '',
          district: data.district || '',
          starting_price: data.starting_price || 0,
          currency: data.currency || 'AED',
          total_units: data.total_units || 0,
          available_units: data.available_units || 0,
          property_types: data.property_types || [],
          hero_image_url: data.hero_image_url || '/default-image.jpg',
          images: data.images || [],
          description: data.description || '',
          payment_plan: data.payment_plan || null,
          payment_terms: data.payment_terms || null,
          amenities: data.amenities || [],
          facilities: data.facilities || [],
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
          sold_units: data.sold_units || 0,
          brochure_url: data.brochure_url || '',
          video_url: data.video_url || '',
          featured: data.featured || false,
          published: data.published || false,
          handover_date: data.handover_date || '',
          enquiries_count: data.enquiries_count || 0,
          views_count: data.views_count || 0,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          seo_keywords: data.seo_keywords || []
        }
        
        setDetailsModal({ isOpen: true, project: projectDetails })
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  }

  const filteredProjects = selectedDeveloper === 'all' 
    ? projects 
    : projects.filter(project => {
        if (selectedDeveloper === 'emaar') {
          return project.developer?.toLowerCase().includes('emaar')
        } else if (selectedDeveloper === 'damac') {
          return project.developer?.toLowerCase().includes('damac')
        } else if (selectedDeveloper === 'nakheel') {
          return project.developer?.toLowerCase().includes('nakheel')
        }
        return false
      })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitSuccess(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
      setInquiryModal({ isOpen: false, project: null })
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageChange = (projectId: string, direction: 'next' | 'prev') => {
    const currentIndex = selectedImageIndex[projectId] || 0
    const project = projects.find(p => p.id === projectId)
    if (!project || !project.images || project.images.length === 0) return

    const maxIndex = project.images.length - 1
    let newIndex

    if (direction === 'next') {
      newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1
    }

    setSelectedImageIndex(prev => ({
      ...prev,
      [projectId]: newIndex
    }))
  }

  // Video URL type check karna
  const getVideoType = (url: string) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url)) return 'direct';
    return 'external';
  }

  // YouTube video ID extract karna
  const extractYouTubeId = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1];
    }
    return videoId;
  }

  // Vimeo video ID extract karna
  const extractVimeoId = (url: string) => {
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    return vimeoMatch ? vimeoMatch[1] : '';
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <Image 
            src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Dubai Projects"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-b from-secondary/60 via-secondary/40 to-white"></div>
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <span className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm font-bold tracking-widest uppercase rounded-full mb-6">
            Iconic Developments
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
            masterpiece <span className="text-primary italic">Projects</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover Dubai's most ambitious architectural marvels and high-yield investment opportunities in off-plan properties.
          </p>
        </div>
      </section>

      {/* About Off-Plan Properties Section */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-secondary mb-8">
              Why Invest in <span className="text-primary italic">Off-Plan Properties</span>?
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Off-plan properties represent one of the most lucrative investment opportunities in Dubai's dynamic real estate market. 
              By purchasing properties before construction begins, investors can secure prime locations at competitive prices with significant appreciation potential.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowTrendingUpIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-secondary mb-4">Capital Appreciation</h3>
              <p className="text-slate-600 leading-relaxed">
                Dubai's property market has shown consistent growth, with off-plan properties offering 8-15% annual appreciation 
                as developments progress and infrastructure improves.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CurrencyDollarIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-secondary mb-4">Flexible Payment Plans</h3>
              <p className="text-slate-600 leading-relaxed">
                Developers offer extended payment plans spanning 4-6 years, allowing investors to spread payments over time 
                while construction progresses and value increases.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-secondary mb-4">Modern Specifications</h3>
              <p className="text-slate-600 leading-relaxed">
                New developments feature cutting-edge technology, sustainable design, and premium finishes that exceed 
                current standards, ensuring long-term value and modern living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-serif text-secondary mb-4">
              Featured {selectedDeveloper === 'all' ? 'Projects' : developers.find(d => d.id === selectedDeveloper)?.name}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {selectedDeveloper === 'all' 
                ? 'Explore our curated selection of premium off-plan properties from Dubai\'s leading developers'
                : `Discover exceptional properties from ${developers.find(d => d.id === selectedDeveloper)?.name}`
              }
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl text-slate-400 mb-2">No projects found</h3>
              <p className="text-slate-500">Try selecting a different developer filter</p>
            </div>
          ) : (
            <div className="grid gap-12">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 group flex flex-col lg:flex-row hover:shadow-primary/10 transition-shadow duration-500"
                >
                  {/* Image Section */}
                  <div className="lg:w-2/5 relative h-[400px] lg:h-auto overflow-hidden">
                    <Image 
                      src={project.hero_image_url || '/default-image.jpg'}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-image.jpg'
                      }}
                    />
                    
                    {/* Image Navigation */}
                    {project.images && project.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => handleImageChange(project.id, 'prev')}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleImageChange(project.id, 'next')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {project.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(prev => ({ ...prev, [project.id]: index }))}
                              className={`w-2 h-2 rounded-full transition-all ${
                                (selectedImageIndex[project.id] || 0) === index ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${
                        project.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-primary text-secondary'
                      }`}>
                        {project.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="absolute bottom-6 left-6">
                      <button
                        onClick={() => handleViewDetails(project.id)}
                        className="px-6 py-3 bg-primary text-secondary font-bold rounded-full flex items-center gap-2 hover:bg-secondary hover:text-white transition-all shadow-lg hover:shadow-xl"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-primary mb-4">
                      <SparklesIcon className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">{project.developer || 'Developer'}</span>
                    </div>
                    
                    <h3 className="text-4xl font-serif text-secondary mb-6 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    
                    <p className="text-slate-500 mb-8 leading-relaxed text-lg">
                      {project.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Location</div>
                        <div className="text-secondary font-bold flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 text-primary" />
                          {project.area || project.city}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Completion</div>
                        <div className="text-secondary font-bold flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {project.completion_date ? new Date(project.completion_date).getFullYear() : 'TBA'}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Available Units</div>
                        <div className="text-secondary font-bold text-sm">
                          {project.available_units} / {project.total_units}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Price Range</div>
                        <div className="text-secondary font-bold text-sm">
                          {project.currency} {project.min_price ? `${project.min_price}K` : 'N/A'} - {project.max_price ? `${project.max_price}K` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Amenities/Facilities show karen */}
                    <div className="mb-8">
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-3">Amenities & Features</div>
                      <div className="flex flex-wrap gap-2">
                        {project.amenities && project.amenities.length > 0 ? (
                          project.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                              {amenity}
                            </span>
                          ))
                        ) : project.facilities && project.facilities.length > 0 ? (
                          project.facilities.slice(0, 4).map((facility, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                              {facility}
                            </span>
                          ))
                        ) : project.property_types && project.property_types.length > 0 ? (
                          project.property_types.slice(0, 4).map((type, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                              {type}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-sm rounded-full">
                            Features coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => handleViewDetails(project.id)}
                        className="px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all flex items-center gap-2"
                      >
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                        View Full Details
                      </button>
                      
                      <button
                        onClick={() => setInquiryModal({ isOpen: true, project: project })}
                        className="px-8 py-3 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all"
                      >
                        Request Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investment Benefits Section */}
      <section className="py-24 bg-secondary text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              Investment <span className="text-primary italic">Benefits</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Dubai's off-plan property market offers unparalleled opportunities for investors seeking capital growth and rental income
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8-15%</div>
              <div className="text-lg font-semibold mb-4">Annual Appreciation</div>
              <p className="text-slate-300">Consistent property value growth driven by Dubai's expanding economy and infrastructure development</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4-6 Years</div>
              <div className="text-lg font-semibold mb-4">Payment Plans</div>
              <p className="text-slate-300">Extended payment schedules allowing investors to spread costs while construction progresses</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <div className="text-lg font-semibold mb-4">Interest Payments</div>
              <p className="text-slate-300">No interest charges on construction payments, preserving capital for other investments</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5-8%</div>
              <div className="text-lg font-semibold mb-4">Rental Yield</div>
              <p className="text-slate-300">Competitive rental returns from Dubai's growing expatriate and tourist population</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      {detailsModal.isOpen && detailsModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/90 backdrop-blur-lg overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn my-8 mt-40">
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-10 py-6 flex justify-between items-center">
              <h2 className="text-3xl font-serif text-secondary">
                {detailsModal.project.name} - Complete Details
              </h2>
              <button 
                onClick={() => setDetailsModal({ isOpen: false, project: null })}
                className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto">
              {/* Hero Image and Basic Info */}
              <div className="relative h-96">
                <Image 
                  src={detailsModal.project.hero_image_url || '/default-image.jpg'}
                  alt={detailsModal.project.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/default-image.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent flex items-end">
                  <div className="p-10 text-white">
                    <h3 className="text-4xl font-serif mb-2">{detailsModal.project.name}</h3>
                    <p className="text-xl opacity-90">{detailsModal.project.developer}</p>
                  </div>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column - Basic Information */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Project Description */}
                  <div>
                    <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-6 w-6 text-primary" />
                      Project Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {detailsModal.project.description}
                    </p>
                  </div>

                  {/* Key Features Grid */}
                  <div>
                    <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
                      <HomeModernIcon className="h-6 w-6 text-primary" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Project Status</div>
                        <div className="text-lg font-bold text-secondary">{detailsModal.project.status}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Total Units</div>
                        <div className="text-lg font-bold text-secondary">{detailsModal.project.total_units}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Available Units</div>
                        <div className="text-lg font-bold text-secondary">{detailsModal.project.available_units}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Sold Units</div>
                        <div className="text-lg font-bold text-secondary">{detailsModal.project.sold_units}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Price Range</div>
                        <div className="text-lg font-bold text-secondary">
                          {detailsModal.project.currency} {detailsModal.project.min_price}K - {detailsModal.project.max_price}K
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-sm text-slate-400">Starting Price</div>
                        <div className="text-lg font-bold text-secondary">
                          {detailsModal.project.currency} {detailsModal.project.starting_price}K
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Section - Universal Video Player */}
                  {detailsModal.project.video_url && getVideoType(detailsModal.project.video_url) !== 'none' && (
                    <div>
                      <h3 className="text-2xl font-serif text-secondary mb-4 flex items-center gap-2">
                        <VideoCameraIcon className="h-6 w-6 text-primary" />
                        Project Video
                      </h3>
                      
                      <div className="rounded-2xl overflow-hidden bg-black border-2 border-slate-800">
                        <div className="relative w-full h-[400px]">
                          {(() => {
                            const videoType = getVideoType(detailsModal.project.video_url);
                            const videoUrl = detailsModal.project.video_url;
                            
                            if (videoType === 'youtube') {
                              const videoId = extractYouTubeId(videoUrl);
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  title={`${detailsModal.project.name} - YouTube Video`}
                                />
                              );
                            }
                            
                            else if (videoType === 'vimeo') {
                              const videoId = extractVimeoId(videoUrl);
                              return (
                                <iframe
                                  src={`https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                  title={`${detailsModal.project.name} - Vimeo Video`}
                                />
                              );
                            }
                            
                            else if (videoType === 'direct') {
                              return (
                                <video
                                  key={videoUrl}
                                  controls
                                  className="w-full h-full object-contain bg-black"
                                  preload="metadata"
                                  playsInline
                                  controlsList="nodownload"
                                >
                                  <source src={videoUrl} type={`video/${videoUrl.split('.').pop()?.split('?')[0]}`} />
                                  Your browser does not support the video tag.
                                </video>
                              );
                            }
                            
                            else {
                              // External video link (Google Drive, Dropbox, etc.)
                              return (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                    <VideoCameraIcon className="h-8 w-8 text-white" />
                                  </div>
                                  <h4 className="text-xl font-semibold text-white mb-2">Video Available</h4>
                                  <p className="text-white/80 mb-6">This video is hosted externally. Click the button below to watch it.</p>
                                  <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-secondary hover:text-white transition-all"
                                  >
                                    <ArrowUpRightIcon className="h-5 w-5" />
                                    Watch Video
                                  </a>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        
                        {/* Video Info Bar */}
                        <div className="p-4 bg-slate-900/90 backdrop-blur-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div>
                            <p className="text-white font-medium">{detailsModal.project.name}</p>
                            <p className="text-white/70 text-sm">Project Video Tour</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={detailsModal.project.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-sm border border-white/30 text-white rounded-lg hover:bg-white hover:text-secondary transition-all inline-flex items-center gap-2"
                            >
                              <ArrowUpRightIcon className="h-4 w-4" />
                              Open in New Tab
                            </a>
                            
                            <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                              {getVideoType(detailsModal.project.video_url).charAt(0).toUpperCase() + getVideoType(detailsModal.project.video_url).slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Images Gallery */}
                  {detailsModal.project.images && detailsModal.project.images.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-serif text-secondary mb-4">Project Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {detailsModal.project.images.map((image, index) => (
                          <div key={index} className="relative h-48 rounded-xl overflow-hidden">
                            <Image
                              src={image}
                              alt={`${detailsModal.project?.name} - Image ${index + 1}`}
                              fill
                              className="object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details Card */}
                <div className="space-y-8">
                  {/* Project Timeline Card */}
                  <div className="bg-secondary text-white p-6 rounded-2xl">
                    <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Project Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-white/20">
                        <span>Launch Date</span>
                        <span className="font-bold">
                          {detailsModal.project.launch_date ? new Date(detailsModal.project.launch_date).toLocaleDateString() : 'TBA'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-white/20">
                        <span>Completion Date</span>
                        <span className="font-bold">
                          {detailsModal.project.completion_date ? new Date(detailsModal.project.completion_date).toLocaleDateString() : 'TBA'}
                        </span>
                      </div>
                      {detailsModal.project.handover_date && (
                        <div className="flex justify-between items-center pb-3 border-b border-white/20">
                          <span>Handover Date</span>
                          <span className="font-bold">
                            {new Date(detailsModal.project.handover_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Details Card */}
                  <div className="border border-slate-200 p-6 rounded-2xl">
                    <h3 className="text-xl font-serif text-secondary mb-6 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-primary" />
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <IdentificationIcon className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="text-sm text-slate-400">Address</div>
                          <div className="font-medium">{detailsModal.project.address || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BuildingLibraryIcon className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="text-sm text-slate-400">City</div>
                          <div className="font-medium">{detailsModal.project.city}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TagIcon className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="text-sm text-slate-400">Area/District</div>
                          <div className="font-medium">{detailsModal.project.area} {detailsModal.project.district ? `- ${detailsModal.project.district}` : ''}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Card */}
                  {detailsModal.project.amenities && detailsModal.project.amenities.length > 0 && (
                    <div className="border border-slate-200 p-6 rounded-2xl">
                      <h3 className="text-xl font-serif text-secondary mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {detailsModal.project.amenities.map((amenity, index) => (
                          <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Types */}
                  {detailsModal.project.property_types && detailsModal.project.property_types.length > 0 && (
                    <div className="border border-slate-200 p-6 rounded-2xl">
                      <h3 className="text-xl font-serif text-secondary mb-4">Property Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {detailsModal.project.property_types.map((type, index) => (
                          <span key={index} className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm rounded-full font-medium">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    
                    {detailsModal.project.brochure_url && (
                      <a
                        href={detailsModal.project.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                        Download Brochure
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Inquiry Modal */}
      {inquiryModal.isOpen && inquiryModal.project && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
            <div className="relative h-48">
              <Image 
                src={inquiryModal.project.hero_image_url || '/default-image.jpg'}
                alt={inquiryModal.project.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/default-image.jpg'
                }}
              />
              <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center">
                <h3 className="text-3xl font-serif text-white">Inquire: {inquiryModal.project.name}</h3>
              </div>
              <button 
                onClick={() => setInquiryModal({ isOpen: false, project: null })}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-10">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">Inquiry Sent Successfully!</h3>
                  <p className="text-slate-600">We'll get back to you within 24 hours with detailed information about {inquiryModal.project.name}.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
                    />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Email Address" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Phone Number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50" 
                  />
                  <textarea 
                    name="message"
                    placeholder="Your Message" 
                    rows={4} 
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 resize-none"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProjectsPageContent />
    </Suspense>
  )
}