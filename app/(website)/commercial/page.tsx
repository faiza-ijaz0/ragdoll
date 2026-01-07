// 'use client';

// import { useState, useEffect } from 'react';
// import { Database } from '@/lib/database.types'
// import PropertyCard, { PropertyCardProperty } from '@/components/property/PropertyCard'

// import {
//   ViewColumnsIcon,
//   QueueListIcon,
//   HomeIcon,
//   SparklesIcon,
//   BuildingOfficeIcon,
//   XMarkIcon,
//   MapPinIcon,
//   VideoCameraIcon,
//   UserIcon,
//   BuildingStorefrontIcon,
//   ArrowsPointingOutIcon,
//   CheckIcon,
//   HomeModernIcon,
//   CalendarIcon,
//   CurrencyDollarIcon,
//   EnvelopeIcon,
//   PhoneIcon,
//   GlobeAltIcon,
//   LanguageIcon,
//   ShieldCheckIcon,
//   ChartBarIcon,
//   StarIcon as StarOutlineIcon
// } from '@heroicons/react/24/outline'
// import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
// import { BathIcon, BedIcon, CarIcon } from 'lucide-react';
// import { useRouter, useSearchParams } from 'next/navigation';

// // Firebase imports
// import { db } from '@/lib/firebase'
// import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'

// type Property = Database['public']['Tables']['properties']['Row']
// type NormalizedProperty = Property & {
//   image: string
//   price: number
//   priceLabel?: string
//   area?: string | null
//   city?: string | null
//   location: string
//   beds: number
//   baths: number
//   sqft: number
//   type: string
//   featured: boolean
//   developer?: string | null
//   description?: string | null
//   category?: string | null
//   parking?: string | null
//   furnished?: boolean | null
//   propertyAge?: string | null
//   completion?: string | null
//   subtype?: string | null
//   features?: string[] | null
//   video_url?: string | null
//   currency?: string
//   status?: string
//   agent_name?: string
//   review_status?: string
//   submitted_at?: string
//   collection?: string
//   address?: string
//   property_status?: string
//   property_age?: string
//   images?: string[]
//   floorplans?: string[]
//   inquiries_count?: number
//   coords?: {
//     lat: number
//     lng: number
//   }
//   agent_id?: string
//   slug?: string
//   created_at?: string
//   updated_at?: string
// }

// // View Details Modal Component - EXACT SAME AS RENT PAGE
// function ViewDetailsModal({ 
//   property, 
//   onClose 
// }: { 
//   property: NormalizedProperty | null; 
//   onClose: () => void 
// }) {
//   if (!property) return null;

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);

//   const handlePrevImage = () => {
//     setCurrentImageIndex(prev => 
//       prev === 0 
//         ? (property.images?.length || property.floorplans?.length || 1) - 1 
//         : prev - 1
//     );
//   };

//   const handleNextImage = () => {
//     setCurrentImageIndex(prev => 
//       prev === (property.images?.length || property.floorplans?.length || 1) - 1 
//         ? 0 
//         : prev + 1
//     );
//   };

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-US').format(price);
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const getPropertyImages = () => {
//     if (property.images && property.images.length > 0) {
//       return property.images;
//     }
//     if (property.floorplans && property.floorplans.length > 0) {
//       return property.floorplans;
//     }
//     return [property.image || ''];
//   };

//   const propertyImages = getPropertyImages();
//   const hasVideo = property.video_url && property.video_url.trim() !== '';

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in mt-32">
//       <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
//         {/* Header with Close Button */}
//         <div className="flex-shrink-0 p-6 border-b border-slate-100 bg-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-black text-slate-900 truncate">
//                 {property.title || 'Untitled Property'}
//               </h2>
//               <div className="flex items-center gap-2 text-slate-600 mt-1">
//                 <MapPinIcon className="h-4 w-4" />
//                 <span className="font-medium truncate">
//                   {property.address || property.location || `${property.area || ''}${property.city ? ', ' + property.city : ''}`}
//                 </span>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:text-primary hover:bg-slate-200 transition-colors"
//             >
//               <XMarkIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         {/* Main Content with Scroll */}
//         <div className="flex-1 overflow-hidden">
//           <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
//             {/* Left Column - Images & Details - WITH SCROLL */}
//             <div className="lg:col-span-2 h-full overflow-y-auto custom-scrollbar">
//               {/* Main Image/Video */}
//               <div className="relative h-64 md:h-80 bg-slate-100 overflow-hidden">
//                 {hasVideo && isVideoPlaying ? (
//                   <video
//                     src={property.video_url}
//                     className="w-full h-full object-cover"
//                     autoPlay
//                     controls
//                     onEnded={() => setIsVideoPlaying(false)}
//                   />
//                 ) : (
//                   <img
//                     src={propertyImages[currentImageIndex]}
//                     alt={property.title || 'Property Image'}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop';
//                     }}
//                   />
//                 )}

//                 {/* Image Navigation */}
//                 {propertyImages.length > 1 && !isVideoPlaying && (
//                   <>
//                     <button
//                       onClick={handlePrevImage}
//                       className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-primary transition-colors shadow-lg"
//                     >
//                       ←
//                     </button>
//                     <button
//                       onClick={handleNextImage}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-primary transition-colors shadow-lg"
//                     >
//                       →
//                     </button>
//                   </>
//                 )}

//                 {/* Video Play Button */}
//                 {hasVideo && !isVideoPlaying && (
//                   <button
//                     onClick={() => setIsVideoPlaying(true)}
//                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary hover:scale-110 transition-transform shadow-xl"
//                   >
//                     <VideoCameraIcon className="h-8 w-8" />
//                   </button>
//                 )}

//                 {/* Badges */}
//                 <div className="absolute top-4 left-4 flex flex-wrap gap-2">
//                   <span className="px-3 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full">
//                     {property.status === 'rent' ? 'For Rent' : 'For Sale'}
//                   </span>
//                   {property.featured && (
//                     <span className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold uppercase tracking-widest rounded-full">
//                       Featured
//                     </span>
//                   )}
//                   {property.collection === 'agent_properties' && (
//                     <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full">
//                       Agent Property
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Thumbnail Gallery */}
//               {propertyImages.length > 1 && (
//                 <div className="p-4 border-b border-slate-100">
//                   <div className="flex gap-2 overflow-x-auto pb-2">
//                     {propertyImages.map((img, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => setCurrentImageIndex(idx)}
//                         className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
//                           idx === currentImageIndex 
//                             ? 'border-primary' 
//                             : 'border-transparent hover:border-slate-300'
//                         }`}
//                       >
//                         <img
//                           src={img}
//                           alt={`Thumbnail ${idx + 1}`}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop';
//                           }}
//                         />
//                       </button>
//                     ))}
//                     {hasVideo && (
//                       <button
//                         onClick={() => setIsVideoPlaying(true)}
//                         className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all relative group"
//                       >
//                         <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
//                           <VideoCameraIcon className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-[9px] text-white font-bold absolute bottom-1 left-1/2 -translate-x-1/2">
//                           Video
//                         </div>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Property Details - WITH SCROLL */}
//               <div className="p-6 space-y-6 ">
//                 {/* Price */}
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">
//                         {property.status === 'rent' ? 'Yearly Rent' : 'Sale Price'}
//                       </div>
//                       <div className="text-2xl md:text-3xl font-black text-primary">
//                         {property.currency || 'AED'} {formatPrice(property.price)}
//                       </div>
//                       {property.status === 'rent' && (
//                         <div className="text-slate-500 text-sm mt-1">
//                           ≈ {property.currency || 'AED'} {formatPrice(Math.round(property.price / 12))} per month
//                         </div>
//                       )}
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-slate-500 mb-1">Property ID</div>
//                       <div className="font-mono font-bold text-slate-700">
//                         {property.id.substring(0, 8).toUpperCase()}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Key Features */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center gap-2 mb-1">
//                       <BedIcon className="h-4 w-4 text-primary" />
//                       <span className="text-lg font-black text-slate-900">{property.beds || 0}</span>
//                     </div>
//                     <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Bedrooms</div>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center gap-2 mb-1">
//                       <BathIcon className="h-4 w-4 text-primary" />
//                       <span className="text-lg font-black text-slate-900">{property.baths || 0}</span>
//                     </div>
//                     <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Bathrooms</div>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center gap-2 mb-1">
//                       <ArrowsPointingOutIcon className="h-4 w-4 text-primary" />
//                       <span className="text-lg font-black text-slate-900">{property.sqft || 0}</span>
//                     </div>
//                     <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Sq. Ft.</div>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center gap-2 mb-1">
//                       <HomeModernIcon className="h-4 w-4 text-primary" />
//                       <span className="text-lg font-black text-slate-900">
//                         {property.property_age || property.propertyAge || 'N/A'}
//                       </span>
//                     </div>
//                     <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Property Age</div>
//                   </div>
//                 </div>

//                 {/* Basic Info */}
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <div className="text-slate-500 mb-1">Property Type</div>
//                     <div className="font-medium text-slate-900">{property.type || 'Property Type'}</div>
//                   </div>
//                   <div>
//                     <div className="text-slate-500 mb-1">Completion Status</div>
//                     <div className="font-medium text-slate-900">
//                       {property.completion || property.property_status || 'Ready'}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-slate-500 mb-1">Furnishing</div>
//                     <div className="font-medium text-slate-900">
//                       {property.furnished ? 'Furnished' : 'Unfurnished'}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-slate-500 mb-1">Parking</div>
//                     <div className="font-medium text-slate-900">
//                       {property.parking === 'yes' ? 'Available' : 'Not Available'}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 {property.description && (
//                   <div>
//                     <h3 className="text-lg font-black text-slate-900 mb-3">Description</h3>
//                     <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
//                       <p className="text-slate-600 leading-relaxed whitespace-pre-line">
//                         {property.description}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Features List */}
//                 {property.features && property.features.length > 0 && (
//                   <div>
//                     <h3 className="text-lg font-black text-slate-900 mb-3">Features & Amenities</h3>
//                     <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {property.features.map((feature, idx) => (
//                           <div key={idx} className="flex items-center gap-3">
//                             <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
//                             <span className="text-slate-700">{feature}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Additional Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <h3 className="text-lg font-black text-slate-900 mb-3">Property Details</h3>
//                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Inquiries</span>
//                         <span className="font-medium text-slate-900">
//                           {property.inquiries_count || 0}
//                         </span>
//                       </div>
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Date Added</span>
//                         <span className="font-medium text-slate-900">
//                           {formatDate(property.created_at || property.submitted_at)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Last Updated</span>
//                         <span className="font-medium text-slate-900">
//                           {formatDate(property.updated_at)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Agent</span>
//                         <span className="font-medium text-slate-900">
//                           {property.agent_name || 'N/A'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <h3 className="text-lg font-black text-slate-900 mb-3">Collection Info</h3>
//                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Source</span>
//                         <span className="font-medium text-slate-900">
//                           {property.collection === 'agent_properties' ? 'Agent Properties' : 'Main Properties'}
//                         </span>
//                       </div>
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Review Status</span>
//                         <span className={`font-medium ${
//                           property.review_status === 'published' 
//                             ? 'text-green-600' 
//                             : 'text-amber-600'
//                         }`}>
//                           {property.review_status || 'N/A'}
//                         </span>
//                       </div>
//                       <div className="flex justify-between py-2 border-b border-slate-100">
//                         <span className="text-slate-600">Slug</span>
//                         <span className="font-medium text-slate-900 font-mono text-sm">
//                           {property.slug || 'N/A'}
//                         </span>
//                       </div>
//                       {property.agent_id && (
//                         <div className="flex justify-between py-2 border-b border-slate-100">
//                           <span className="text-slate-600">Agent ID</span>
//                           <span className="font-medium text-slate-900 font-mono text-sm">
//                             {property.agent_id.substring(0, 8)}...
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Coordinates */}
//                 {property.coords && (
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <h3 className="text-lg font-black text-slate-900 mb-2">Location Coordinates</h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <div className="text-sm text-slate-500">Latitude</div>
//                         <div className="font-mono text-slate-900">{property.coords.lat}</div>
//                       </div>
//                       <div>
//                         <div className="text-sm text-slate-500">Longitude</div>
//                         <div className="font-mono text-slate-900">{property.coords.lng}</div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right Column - Action Panel - WITH SCROLL */}
//             <div className="lg:col-span-1 h-full overflow-y-auto custom-scrollbar border-l border-slate-100 bg-slate-50">
//               <div className="p-6 space-y-6">
//                 {/* Contact Agent */}
//                 <div className="bg-white rounded-xl p-4 shadow-sm">
//                   <h3 className="text-lg font-black text-slate-900 mb-4">Contact Information</h3>
                  
//                   {property.agent_id ? (
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-4">
//                         <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//                           <UserIcon className="h-6 w-6 text-primary" />
//                         </div>
//                         <div>
//                           <div className="font-bold text-slate-900">{property.agent_name || 'Agent'}</div>
//                           <div className="text-sm text-slate-500">Property Agent</div>
//                         </div>
//                       </div>
                      
                     
//                     </div>
//                   ) : (
//                     <div className="text-center py-4">
//                       <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
//                         <BuildingStorefrontIcon className="h-6 w-6 text-slate-400" />
//                       </div>
//                       <div className="text-slate-700 mb-4 text-sm">
//                         This property is listed directly by our agency
//                       </div>
//                       <button className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
//                         Contact Our Team
//                       </button>
//                     </div>
//                   )}
//                 </div>

                

//                 {/* Financial Calculator */}
//                 <div className="bg-white rounded-xl p-4 shadow-sm">
//                   <h3 className="text-lg font-black text-slate-900 mb-4">Financial Calculator</h3>
//                   <div className="space-y-4">
//                     <div>
//                       <div className="text-sm text-slate-500 mb-1">Monthly Rent</div>
//                       <div className="text-xl font-black text-primary">
//                         {property.currency || 'AED'} {formatPrice(Math.round(property.price / 12))}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-slate-500 mb-1">Deposit (5%)</div>
//                       <div className="text-lg font-bold text-slate-900">
//                         {property.currency || 'AED'} {formatPrice(Math.round(property.price * 0.05))}
//                       </div>
//                     </div>
//                     <div className="text-xs text-slate-500">
//                       *Calculations are approximate. Contact us for exact figures.
//                     </div>
//                   </div>
//                 </div>

//                 {/* Share Property */}
//                 <div className="border-t border-slate-200 pt-6">
//                   <h3 className="text-lg font-black text-slate-900 mb-4">Share This Property</h3>
//                   <div className="grid grid-cols-3 gap-2">
//                     <button className="h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors text-sm font-bold">
//                       Facebook
//                     </button>
//                     <button className="h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors text-sm font-bold">
//                       Instagram
//                     </button>
//                     <button className="h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors text-sm font-bold">
//                       WhatsApp
//                     </button>
//                   </div>
//                 </div>

//                 {/* Similar Properties Link */}
//                 <div className="text-center pt-4">
//                   <button className="text-primary font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 w-full">
//                     View Similar Properties
//                     <span className="group-hover:translate-x-1 transition-transform">→</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Custom Scrollbar CSS */}
//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//         .custom-scrollbar {
//           scrollbar-width: thin;
//           scrollbar-color: #cbd5e1 #f1f5f9;
//         }
//       `}</style>
//     </div>
//   );
// }

// // Function to fetch property details by ID from specific collection
// async function fetchPropertyDetails(propertyId: string, collectionName: string) {
//   try {
//     console.log(`📋 Fetching details for property ${propertyId} from ${collectionName}...`);
    
//     const docRef = doc(db, collectionName, propertyId);
//     const docSnap = await getDoc(docRef);
    
//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       console.log(`✅ Found property details:`, {
//         title: data.title,
//         collection: collectionName
//       });
      
//       return {
//         id: docSnap.id,
//         collection: collectionName,
//         ...data
//       };
//     } else {
//       console.log(`❌ No property found with ID: ${propertyId} in ${collectionName}`);
//       return null;
//     }
//   } catch (error) {
//     console.error(`❌ Error fetching property details from ${collectionName}:`, error);
//     return null;
//   }
// }

// // Function to fetch ALL properties from 'properties' collection
// async function fetchPropertiesFromMainCollection() {
//   try {
//     console.log('🔥 Fetching ALL properties from main collection...');
//     const propertiesRef = collection(db, 'properties');
    
//     const q = query(
//       propertiesRef,
//       orderBy('updated_at', 'desc')
//     );
    
//     const querySnapshot = await getDocs(q);
//     console.log(`✅ Main Collection: Found ${querySnapshot.size} ALL properties`);
    
//     const properties: any[] = [];
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       properties.push({
//         id: doc.id,
//         collection: 'properties',
//         ...data
//       });
//     });
    
//     return properties;
    
//   } catch (error: any) {
//     console.error('❌ Error fetching properties from main collection:', error.message);
//     return [];
//   }
// }

// // Function to fetch ALL properties from 'agent_properties' collection
// async function fetchPropertiesFromAgentCollection() {
//   try {
//     console.log('🔥 Fetching ALL properties from agent_properties collection...');
//     const agentPropertiesRef = collection(db, 'agent_properties');
    
//     const q = query(
//       agentPropertiesRef,
//       where('review_status', '==', 'published')
//     );
    
//     const querySnapshot = await getDocs(q);
//     console.log(`✅ Agent Collection: Found ${querySnapshot.size} ALL properties`);
    
//     const properties: any[] = [];
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       properties.push({
//         id: doc.id,
//         collection: 'agent_properties',
//         ...data
//       });
//     });
    
//     return properties;
    
//   } catch (error: any) {
//     console.error('❌ Error fetching properties from agent collection:', error.message);
//     return [];
//   }
// }

// // Main function to fetch all properties from both collections
// async function fetchAllProperties() {
//   try {
//     console.log('🔄 Fetching ALL properties from ALL collections...');
    
//     const [mainProperties, agentProperties] = await Promise.all([
//       fetchPropertiesFromMainCollection(),
//       fetchPropertiesFromAgentCollection()
//     ]);
    
//     console.log(`📊 Results: ${mainProperties.length} from main, ${agentProperties.length} from agent`);
    
//     const allProperties = [...mainProperties, ...agentProperties];
//     console.log(`✅ Total ALL properties found: ${allProperties.length}`);
    
//     return allProperties;
    
//   } catch (error) {
//     console.error('❌ Error in fetchAllProperties:', error);
//     return [];
//   }
// }

// // Function to get property type display name and emoji
// function getTypeInfo(type: string) {
//   const typeMap: Record<string, { label: string; emoji: string; color: string }> = {
//     'apartment': { label: 'Apartment', emoji: '🏢', color: 'bg-purple-500' },
//     'villa': { label: 'Villa', emoji: '🏰', color: 'bg-amber-500' },
//     'townhouse': { label: 'Townhouse', emoji: '🏘️', color: 'bg-teal-500' },
//     'commercial': { label: 'Commercial', emoji: '🏪', color: 'bg-blue-500' },
//     'plot': { label: 'Plot', emoji: '📐', color: 'bg-green-500' },
//     'furnished-studio': { label: 'Furnished Studio', emoji: '🌟', color: 'bg-pink-500' },
//     'residential-plot': { label: 'Residential Plot', emoji: '🏡', color: 'bg-green-600' },
//     'industrial-plot': { label: 'Industrial Plot', emoji: '🏭', color: 'bg-gray-500' },
//   };
  
//   return typeMap[type] || { label: type, emoji: '🏠', color: 'bg-gray-500' };
// }

// export default function CommercialPropertiesPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
  
//   // State for properties
//   const [allProperties, setAllProperties] = useState<NormalizedProperty[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<NormalizedProperty[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // ADD THESE STATES FOR MODAL
//   const [selectedProperty, setSelectedProperty] = useState<NormalizedProperty | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
  
//   // Get URL parameters
//   const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
//   const category = searchParams.get('category');
//   const feature = searchParams.get('feature');
//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const limit = 20;

//   // Determine active filter from URL
//   const activeFilter = feature || category;

//   // Handle View Details Click - EXACT SAME AS RENT PAGE
//   const handleViewDetails = async (property: NormalizedProperty) => {
//     try {
//       console.log(`🔄 Loading details for property: ${property.id} from ${property.collection}`);
      
//       // Fetch complete details from Firebase
//       const detailedProperty = await fetchPropertyDetails(property.id, property.collection || 'properties');
      
//       if (detailedProperty) {
//         // Normalize the detailed property
//         const normalized = {
//           ...detailedProperty,
//           image: property.image || detailedProperty.images?.[0] || detailedProperty.image_url || '',
//           price: detailedProperty.price || 0,
//           priceLabel: detailedProperty.status === 'rent' ? 'yearly' : 'total',
//           area: detailedProperty.area || detailedProperty.location || detailedProperty.address || 'Dubai',
//           city: detailedProperty.city || 'Dubai',
//           location: detailedProperty.address || detailedProperty.area || detailedProperty.city || 'Dubai',
//           beds: detailedProperty.beds || 0,
//           baths: detailedProperty.baths || 0,
//           sqft: detailedProperty.sqft || 0,
//           type: detailedProperty.type || detailedProperty.subtype || 'Property',
//           developer: detailedProperty.developer || null,
//           featured: Boolean(detailedProperty.featured),
//           category: detailedProperty.category || null,
//           parking: detailedProperty.parking || null,
//           propertyAge: detailedProperty.property_age || detailedProperty.propertyAge || null,
//           completion: detailedProperty.completion || detailedProperty.property_status || 'ready',
//           subtype: detailedProperty.subtype || null,
//           description: detailedProperty.description || null,
//           features: Array.isArray(detailedProperty.features) ? detailedProperty.features : [],
//           video_url: detailedProperty.video_url || null,
//           currency: detailedProperty.currency || 'AED',
//           status: detailedProperty.status || 'sale',
//           agent_name: detailedProperty.agent_name || null,
//           review_status: detailedProperty.review_status || null,
//           submitted_at: detailedProperty.submitted_at || null,
//           collection: detailedProperty.collection || 'properties',
//           address: detailedProperty.address,
//           property_status: detailedProperty.property_status,
//           property_age: detailedProperty.property_age,
//           images: detailedProperty.images || [],
//           floorplans: detailedProperty.floorplans || [],
//           inquiries_count: detailedProperty.inquiries_count || 0,
//           coords: detailedProperty.coords,
//           agent_id: detailedProperty.agent_id,
//           slug: detailedProperty.slug,
//           created_at: detailedProperty.created_at,
//           updated_at: detailedProperty.updated_at
//         };
        
//         setSelectedProperty(normalized);
//         setIsModalOpen(true);
//         console.log('✅ Property details loaded successfully');
//       } else {
//         console.log('⚠️ Using cached property data');
//         setSelectedProperty(property);
//         setIsModalOpen(true);
//       }
//     } catch (error) {
//       console.error('❌ Error loading property details:', error);
//       // Fallback to cached property data
//       setSelectedProperty(property);
//       setIsModalOpen(true);
//     }
//   };

//   // Close Details Modal
//   const closeDetailsModal = () => {
//     setSelectedProperty(null);
//     setIsModalOpen(false);
//   };

//   // Fetch properties on component mount
//   useEffect(() => {
//     async function loadProperties() {
//       setLoading(true);
//       console.log('🔄 Loading ALL properties...');
//       const properties = await fetchAllProperties();
      
//       const normalized = properties.map((p: any) => {
//         // Get first image
//         let imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        
//         if (p.images && Array.isArray(p.images) && p.images.length > 0) {
//           imageUrl = p.images[0];
//         } else if (p.image) {
//           imageUrl = p.image;
//         } else if (p.image_url) {
//           imageUrl = p.image_url;
//         }
        
//         const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
//         const location = p.location || p.address || p.area || p.city || 'Dubai';
//         const propertyArea = p.area || p.location || p.address || p.neighborhood || p.district || 'Dubai';
//         const priceLabel = p.status === 'rent' ? 'yearly' : 'total';
        
//         let featuresArray: string[] = [];
//         if (Array.isArray(p.features)) {
//           featuresArray = p.features;
//         } else if (typeof p.features === 'string') {
//           featuresArray = p.features.split(',').map((f: string) => f.trim());
//         }
        
//         return {
//           ...p,
//           image: imageUrl,
//           price: price,
//           priceLabel: priceLabel,
//           area: propertyArea,
//           city: p.city || 'Dubai',
//           location: location,
//           beds: p.beds ?? 0,
//           baths: p.baths ?? 0,
//           sqft: p.sqft ?? 0,
//           type: p.type || 'commercial',
//           developer: p.developer || (p.developers?.name ? p.developers.name : null) || p.developer_id || null,
//           featured: Boolean(p.featured),
//           category: p.category || null,
//           parking: p.parking || null,
//           propertyAge: p.property_age || p.propertyAge || null,
//           completion: p.completion || p.property_status || 'ready',
//           subtype: p.subtype || null,
//           description: p.description || null,
//           features: featuresArray,
//           video_url: p.video_url || null,
//           currency: p.currency || 'AED',
//           status: p.status || 'sale',
//           agent_name: p.agent_name || null,
//           review_status: p.review_status || null,
//           submitted_at: p.submitted_at || null,
//           collection: p.collection || 'properties'
//         };
//       });
      
//       console.log(`✅ Normalized ${normalized.length} ALL properties`);
//       console.log('📊 Property types found:', [...new Set(normalized.map(p => p.type))]);
//       setAllProperties(normalized);
//       setLoading(false);
//     }
    
//     loadProperties();
//   }, []);

//   // Filter properties based on URL params
//   useEffect(() => {
//     if (allProperties.length === 0) return;
    
//     let filtered = [...allProperties];
    
//     // Filter by feature (property type)
//     if (feature) {
//       console.log(`🔍 Filtering by feature: ${feature}`);
      
//       // Map URL features to property types
//       const featureToTypeMap: Record<string, string[]> = {
//         'townhouse': ['townhouse'],
//         'villas': ['villa'],
//         'apartments': ['apartment'],
//         'commercial': ['commercial'],
//         'plots': ['plot', 'residential-plot', 'industrial-plot'],
//         'studios': ['furnished-studio'],
//       };
      
//       const typesToFilter = featureToTypeMap[feature] || [feature];
//       filtered = filtered.filter(p => typesToFilter.includes(p.type));
      
//       console.log(`📊 Found ${filtered.length} properties of type: ${typesToFilter.join(', ')}`);
//     }
    
//     // Filter by category (commercial ke liye special filters)
//     if (category === 'commercial') {
//       // Commercial specific filters - example: high price, office spaces, etc.
//       filtered = filtered.filter(p => p.type === 'commercial');
//     }
    
//     setFilteredProperties(filtered);
//   }, [allProperties, category, feature]);

//   // Handle view change
//   const handleViewChange = (view: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('view', view);
//     params.set('page', '1');
//     router.push(`/commercial-properties?${params.toString()}`);
//   };

//   // Handle page change
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`/commercial-properties?${params.toString()}`);
//   };

//   // Handle filter click
//   const handleFilterClick = (filterType: string, filterValue: string) => {
//     const params = new URLSearchParams();
//     if (filterType === 'category') {
//       params.set('category', filterValue);
//     } else if (filterType === 'feature') {
//       params.set('feature', filterValue);
//     }
//     params.set('view', viewMode);
//     params.set('page', '1');
//     router.push(`/commercial-properties?${params.toString()}`);
//   };

//   // Clear all filters
//   const handleClearFilters = () => {
//     const params = new URLSearchParams();
//     params.set('view', viewMode);
//     router.push(`/commercial-properties?${params.toString()}`);
//   };

//   // Pagination calculations
//   const total = filteredProperties.length;
//   const totalPages = Math.max(1, Math.ceil(total / limit));
//   const offset = (Math.max(page, 1) - 1) * limit;
//   const paginatedProperties = filteredProperties.slice(offset, offset + limit);

//   // Get page title based on filter
//   const getPageTitle = () => {
//     if (feature === 'townhouse') return 'Townhouses';
//     if (feature === 'villas') return 'Villas';
//     if (feature === 'apartments') return 'Apartments';
//     if (feature === 'commercial') return 'Commercial Properties';
//     if (feature === 'plots') return 'Plots & Land';
//     if (feature === 'studios') return 'Furnished Studios';
//     if (category === 'commercial') return 'Commercial Properties';
//     return 'All Properties';
//   };

//   // Get page description based on filter
//   const getPageDescription = () => {
//     if (feature === 'townhouse') return 'Discover premium townhouses in Dubai with modern amenities and prime locations.';
//     if (feature === 'villas') return 'Explore luxurious villas with private amenities and exclusive community access.';
//     if (feature === 'apartments') return 'Find modern apartments with stunning views and convenient locations.';
//     if (feature === 'commercial') return 'Commercial spaces for businesses seeking prime locations in Dubai.';
//     if (feature === 'plots') return 'Available plots and land for residential and commercial development.';
//     if (feature === 'studios') return 'Fully furnished studios with all amenities included for comfortable living.';
//     if (category === 'commercial') return 'Discover premium commercial spaces in Dubai for your business needs. Offices, retail spaces, warehouses, and more.';
//     return 'Discover Dubai\'s finest collection of ALL property types - Apartments, Villas, Townhouses, Commercial spaces and more.';
//   };

//   // Calculate agent properties count
//   const agentPropertiesCount = filteredProperties.filter(p => p.collection === 'agent_properties').length;
//   const mainPropertiesCount = filteredProperties.filter(p => p.collection === 'properties').length;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-blue-600 font-medium">Loading properties...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white-50 to-white">
//       {/* View Details Modal - EXACT SAME AS RENT PAGE */}
//       {isModalOpen && selectedProperty && (
//         <ViewDetailsModal 
//           property={selectedProperty} 
//           onClose={closeDetailsModal} 
//         />
//       )}

//       {/* Hero Section */}
//        <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"> 
      
//         <div className="absolute inset-0 opacity-10">
//           <img 
//             src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80" 
//             alt="Commercial Building" 
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900" />
        
//         <div className="container-custom relative z-10">
//           <div className="max-w-5xl mx-auto text-center space-y-6">
            
              
//               <h2 className="text-white font-bold tracking-[0.3em] uppercase text-sm">
//                 {activeFilter ? getPageTitle() : 'ALL Properties Collection'}
//               </h2>
           
            
//             <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight animate-slide-up [animation-delay:100ms]">
//               {getPageTitle()}
//             </h1>
            
//             <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
//               {getPageDescription()}
//             </p>

//             {/* Property Stats and Filter Info */}
//             <div className="flex flex-wrap justify-center gap-3 pt-6 animate-slide-up [animation-delay:300ms]">
//               <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
//                 {total} Properties
//               </span>
              
            
              
             
              
//               {!activeFilter && (
//                 <span className="px-6 py-2 bg-green-500/20 backdrop-blur-md text-green-300 rounded-full border border-green-400/30 text-sm font-bold">
//                   🏢 {new Set(allProperties.map(p => p.type)).size} Property Types
//                 </span>

//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <div className="container-custom py-8 sm:py-16">
//         <div className="flex flex-col">
//           {/* View Controls and Filters */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 bg-white p-4 sm:p-4 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-sm">
//             <div className="flex items-center gap-4 pl-4">
//               <span className="text-black font-bold text-sm uppercase tracking-widest">
//                 {total} Properties 
//               </span>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Quick Filter Buttons */}
             
//               {/* View Toggle */}
//               <div className="flex bg-blue-50 p-1 rounded-xl">
//                 <button
//                   type="button"
//                   onClick={() => handleViewChange('grid')}
//                   className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-500' : 'text-blue-400 hover:text-blue-600'}`}
//                 >
//                   <ViewColumnsIcon className="h-5 w-5" />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleViewChange('list')}
//                   className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-500' : 'text-blue-400 hover:text-blue-600'}`}
//                 >
//                   <QueueListIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Properties Grid/List */}
//           {filteredProperties.length > 0 ? (
//             <>
//               <div className={`grid gap-8 ${
//                 viewMode === 'grid'
//                   ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
//                   : 'grid-cols-1'
//               }`}>
//                 {paginatedProperties.map((property, i) => {
//                   const typeInfo = getTypeInfo(property.type);
                  
//                   return (
//                     <div key={`${property.collection}-${property.id}`} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
//                       <div className="relative group">
//                         <PropertyCard
//                           property={{
//                             id: String(property.id),
//                             title: property.title || 'Property',
//                             price: property.price ?? 0,
//                             priceLabel: property.status === 'rent' ? 'yearly' : 'total',
//                             image: property.image,
//                             location: property.location || `${property.area || ''}${property.city ? ', ' + property.city : ''}`,
//                             beds: property.beds ?? 0,
//                             baths: property.baths ?? 0,
//                             sqft: property.sqft ?? 0,
//                             type: property.type || 'Property',
//                             featured: Boolean(property.featured),
//                             currency: property.currency || 'AED',
//                             status: property.status || 'sale',
//                             area: property.area || undefined,
//                             city: property.city || undefined,
//                             video_url: property.video_url || undefined,
//                             agent_name: property.agent_name || undefined,
//                           }}
//                         />
                        
//                         {/* ADD VIEW DETAILS BUTTON - EXACT SAME AS RENT PAGE */}
//                         <button
//                           onClick={() => handleViewDetails(property)}
//                           className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-blue-200 flex items-center gap-2 text-blue-700 hover:text-blue-600 font-bold text-sm z-10"
//                         >
//                           <ArrowsPointingOutIcon className="h-4 w-4" />
//                           View Details
//                         </button>
                        
//                         {/* Property Badges */}
//                         <div className="absolute top-4 left-4 flex flex-col gap-2">
//                           <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${typeInfo.color} text-white shadow-lg`}>
//                             {typeInfo.emoji} {typeInfo.label}
//                           </span>
//                           {property.status === 'rent' ? (
//                             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
//                               🔑 For Rent
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg">
//                               🏠 For Sale
//                             </span>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Additional Info */}
//                       <div className="mt-3 flex gap-2">
//                         {property.featured && (
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                             ⭐ Featured
//                           </span>
//                         )}
//                         {property.collection === 'agent_properties' && (
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                             🤝 Agent Property
//                           </span>
//                         )}
//                         {property.agent_name && (
//                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             👤 {property.agent_name}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="mt-16 flex items-center justify-center gap-2">
//                   {page > 1 && (
//                     <button
//                       onClick={() => handlePageChange(page - 1)}
//                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all font-bold shadow-sm"
//                     >
//                       ←
//                     </button>
//                   )}

//                   {[...Array(totalPages)].map((_, i) => {
//                     const p = i + 1;
//                     if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
//                       return (
//                         <button
//                           key={p}
//                           onClick={() => handlePageChange(p)}
//                           className={`h-12 w-12 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
//                             page === p 
//                               ? 'bg-blue-500 text-white shadow-blue-500/20' 
//                               : 'bg-white border border-blue-100 text-blue-600 hover:bg-blue-50'
//                           }`}
//                         >
//                           {p}
//                         </button>
//                       );
//                     }
//                     if (p === page - 2 || p === page + 2) {
//                       return <span key={p} className="text-blue-300">...</span>;
//                     }
//                     return null;
//                   })}

//                   {page < totalPages && (
//                     <button
//                       onClick={() => handlePageChange(page + 1)}
//                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all font-bold shadow-sm"
//                     >
//                       →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-32 bg-white rounded-[3rem] border border-blue-100 shadow-sm">
//               <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <BuildingOfficeIcon className="h-12 w-12 text-blue-300" />
//               </div>
//               <h3 className="text-2xl font-black text-blue-900 mb-2">No properties found</h3>
//               <p className="text-blue-500 font-medium max-w-xs mx-auto">
//                 {activeFilter 
//                   ? `No ${getPageTitle().toLowerCase()} available at the moment.`
//                   : 'No properties available at the moment.'
//                 }
//               </p>
//               {activeFilter && (
//                 <button
//                   onClick={handleClearFilters}
//                   className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                 >
//                   View All Properties
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Simple CTA Section */}
//       <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-20">
//         <div className="container-custom">
//           <div className="max-w-4xl mx-auto text-center text-white">
//             <h2 className="text-3xl md:text-5xl font-black mb-6">
//               Find Your {getPageTitle()}
//             </h2>
//             <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
//               Browse our collection of premium properties from both our main listings and agent submissions.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// neww
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Database } from '@/lib/database.types'
import PropertyCard, { PropertyCardProperty } from '@/components/property/PropertyCard'

import {
  ViewColumnsIcon,
  QueueListIcon,
  HomeIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  MapPinIcon,
  VideoCameraIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  HomeModernIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LanguageIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  StarIcon as StarOutlineIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { BathIcon, BedIcon, CarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Firebase imports
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'

type Property = Database['public']['Tables']['properties']['Row']

// FIXED: Add image property explicitly to NormalizedProperty
type NormalizedProperty = Property & {
  // Explicitly add image property since Property type might not have it
  image: string
  price: number
  priceLabel?: string
  area?: string | null
  city?: string | null
  location: string
  beds: number
  baths: number
  sqft: number
  type: string
  featured: boolean
  developer?: string | null
  description?: string | null
  category?: string | null
  parking?: string | null
  furnished?: boolean | null
  propertyAge?: string | null
  completion?: string | null
  subtype?: string | null
  features?: string[] | null
  video_url?: string | null
  currency?: string
  status?: string
  agent_name?: string | null
  review_status?: string | null
  submitted_at?: string
  collection?: string
  address?: string
  property_status?: string
  property_age?: string
  images?: string[]
  floorplans?: string[]
  inquiries_count?: number
  coords?: {
    lat: number
    lng: number
  }
  agent_id?: string
  slug?: string
  created_at?: string
  updated_at?: string
  developers?: any
  neighborhood?: string
  district?: string
  image_url?: string  // Add this for consistency
}

// View Details Modal Component
function ViewDetailsModal({ 
  property, 
  onClose 
}: { 
  property: NormalizedProperty | null; 
  onClose: () => void 
}) {
  if (!property) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handlePrevImage = () => {
    const totalImages = (property.images?.length || property.floorplans?.length || 1);
    setCurrentImageIndex(prev => 
      prev === 0 
        ? totalImages - 1 
        : prev - 1
    );
  };

  const handleNextImage = () => {
    const totalImages = (property.images?.length || property.floorplans?.length || 1);
    setCurrentImageIndex(prev => 
      prev === totalImages - 1 
        ? 0 
        : prev + 1
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getPropertyImages = () => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    if (property.floorplans && property.floorplans.length > 0) {
      return property.floorplans;
    }
    // Use property.image which is now guaranteed to exist
    return [property.image || ''];
  };

  const propertyImages = getPropertyImages();
  const hasVideo = property.video_url && property.video_url.trim() !== '';

  // Ensure we have a valid image index
  useEffect(() => {
    if (propertyImages.length > 0 && currentImageIndex >= propertyImages.length) {
      setCurrentImageIndex(0);
    }
  }, [propertyImages, currentImageIndex]);

  // Rest of the ViewDetailsModal component remains the same...
  // [Previous ViewDetailsModal JSX code here - unchanged]

}

// Function to fetch property details by ID from specific collection
async function fetchPropertyDetails(propertyId: string, collectionName: string) {
  try {
    console.log(`📋 Fetching details for property ${propertyId} from ${collectionName}...`);
    
    const docRef = doc(db, collectionName, propertyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`✅ Found property details:`, {
        title: data.title,
        collection: collectionName
      });
      
      return {
        id: docSnap.id,
        collection: collectionName,
        ...data
      } as any;
    } else {
      console.log(`❌ No property found with ID: ${propertyId} in ${collectionName}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching property details from ${collectionName}:`, error);
    return null;
  }
}

// Function to fetch ALL properties from 'properties' collection
async function fetchPropertiesFromMainCollection() {
  try {
    console.log('🔥 Fetching ALL properties from main collection...');
    const propertiesRef = collection(db, 'properties');
    
    const q = query(
      propertiesRef,
      orderBy('updated_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Main Collection: Found ${querySnapshot.size} ALL properties`);
    
    const properties: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        collection: 'properties',
        ...data
      });
    });
    
    return properties;
    
  } catch (error: any) {
    console.error('❌ Error fetching properties from main collection:', error.message);
    return [];
  }
}

// Function to fetch ALL properties from 'agent_properties' collection
async function fetchPropertiesFromAgentCollection() {
  try {
    console.log('🔥 Fetching ALL properties from agent_properties collection...');
    const agentPropertiesRef = collection(db, 'agent_properties');
    
    const q = query(
      agentPropertiesRef,
      where('review_status', '==', 'published')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Agent Collection: Found ${querySnapshot.size} ALL properties`);
    
    const properties: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        collection: 'agent_properties',
        ...data
      });
    });
    
    return properties;
    
  } catch (error: any) {
    console.error('❌ Error fetching properties from agent collection:', error.message);
    return [];
  }
}

// Main function to fetch all properties from both collections
async function fetchAllProperties() {
  try {
    console.log('🔄 Fetching ALL properties from ALL collections...');
    
    const [mainProperties, agentProperties] = await Promise.all([
      fetchPropertiesFromMainCollection(),
      fetchPropertiesFromAgentCollection()
    ]);
    
    console.log(`📊 Results: ${mainProperties.length} from main, ${agentProperties.length} from agent`);
    
    const allProperties = [...mainProperties, ...agentProperties];
    console.log(`✅ Total ALL properties found: ${allProperties.length}`);
    
    return allProperties;
    
  } catch (error) {
    console.error('❌ Error in fetchAllProperties:', error);
    return [];
  }
}

// Function to get property type display name and emoji
function getTypeInfo(type: string) {
  const typeMap: Record<string, { label: string; emoji: string; color: string }> = {
    'apartment': { label: 'Apartment', emoji: '🏢', color: 'bg-purple-500' },
    'villa': { label: 'Villa', emoji: '🏰', color: 'bg-amber-500' },
    'townhouse': { label: 'Townhouse', emoji: '🏘️', color: 'bg-teal-500' },
    'commercial': { label: 'Commercial', emoji: '🏪', color: 'bg-blue-500' },
    'plot': { label: 'Plot', emoji: '📐', color: 'bg-green-500' },
    'furnished-studio': { label: 'Furnished Studio', emoji: '🌟', color: 'bg-pink-500' },
    'residential-plot': { label: 'Residential Plot', emoji: '🏡', color: 'bg-green-600' },
    'industrial-plot': { label: 'Industrial Plot', emoji: '🏭', color: 'bg-gray-500' },
  };
  
  return typeMap[type] || { label: type, emoji: '🏠', color: 'bg-gray-500' };
}

function CommercialPropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for properties
  const [allProperties, setAllProperties] = useState<NormalizedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<NormalizedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ADD THESE STATES FOR MODAL
  const [selectedProperty, setSelectedProperty] = useState<NormalizedProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get URL parameters
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const category = searchParams.get('category');
  const feature = searchParams.get('feature');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // Determine active filter from URL
  const activeFilter = feature || category;

  // Handle View Details Click
  const handleViewDetails = async (property: NormalizedProperty) => {
    try {
      console.log(`🔄 Loading details for property: ${property.id} from ${property.collection}`);
      
      // Fetch complete details from Firebase
      const detailedProperty = await fetchPropertyDetails(property.id, property.collection || 'properties');
      
      if (detailedProperty) {
        // Normalize the detailed property
        const normalized: NormalizedProperty = {
          ...detailedProperty,
          // Ensure image property exists
          image: property.image || detailedProperty.images?.[0] || detailedProperty.image_url || '',
          price: detailedProperty.price || 0,
          priceLabel: detailedProperty.status === 'rent' ? 'yearly' : 'total',
          area: detailedProperty.area || detailedProperty.location || detailedProperty.address || 'Dubai',
          city: detailedProperty.city || 'Dubai',
          location: detailedProperty.address || detailedProperty.area || detailedProperty.city || 'Dubai',
          beds: detailedProperty.beds || 0,
          baths: detailedProperty.baths || 0,
          sqft: detailedProperty.sqft || 0,
          type: detailedProperty.type || detailedProperty.subtype || 'Property',
          developer: detailedProperty.developer || null,
          featured: Boolean(detailedProperty.featured),
          category: detailedProperty.category || null,
          parking: detailedProperty.parking || null,
          propertyAge: detailedProperty.property_age || detailedProperty.propertyAge || null,
          completion: detailedProperty.completion || detailedProperty.property_status || 'ready',
          subtype: detailedProperty.subtype || null,
          description: detailedProperty.description || null,
          features: Array.isArray(detailedProperty.features) ? detailedProperty.features : [],
          video_url: detailedProperty.video_url || null,
          currency: detailedProperty.currency || 'AED',
          status: detailedProperty.status || 'sale',
          agent_name: detailedProperty.agent_name || null,
          review_status: detailedProperty.review_status || null,
          submitted_at: detailedProperty.submitted_at || null,
          collection: detailedProperty.collection || 'properties',
          address: detailedProperty.address,
          property_status: detailedProperty.property_status,
          property_age: detailedProperty.property_age,
          images: detailedProperty.images || [],
          floorplans: detailedProperty.floorplans || [],
          inquiries_count: detailedProperty.inquiries_count || 0,
          coords: detailedProperty.coords,
          agent_id: detailedProperty.agent_id,
          slug: detailedProperty.slug,
          created_at: detailedProperty.created_at,
          updated_at: detailedProperty.updated_at,
          id: detailedProperty.id,
          title: detailedProperty.title,
          developers: detailedProperty.developers,
          neighborhood: detailedProperty.neighborhood,
          district: detailedProperty.district,
          image_url: detailedProperty.image_url || ''
        };
        
        setSelectedProperty(normalized);
        setIsModalOpen(true);
        console.log('✅ Property details loaded successfully');
      } else {
        console.log('⚠️ Using cached property data');
        setSelectedProperty(property);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Error loading property details:', error);
      // Fallback to cached property data
      setSelectedProperty(property);
      setIsModalOpen(true);
    }
  };

  // Close Details Modal
  const closeDetailsModal = () => {
    setSelectedProperty(null);
    setIsModalOpen(false);
  };

  // Fetch properties on component mount
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      console.log('🔄 Loading ALL properties...');
      const properties = await fetchAllProperties();
      
      const normalized = properties.map((p: any) => {
        // Get first image
        let imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
          imageUrl = p.images[0];
        } else if (p.image) {
          imageUrl = p.image;
        } else if (p.image_url) {
          imageUrl = p.image_url;
        }
        
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
        const location = p.location || p.address || p.area || p.city || 'Dubai';
        const propertyArea = p.area || p.location || p.address || p.neighborhood || p.district || 'Dubai';
        const priceLabel = p.status === 'rent' ? 'yearly' : 'total';
        
        let featuresArray: string[] = [];
        if (Array.isArray(p.features)) {
          featuresArray = p.features;
        } else if (typeof p.features === 'string') {
          featuresArray = p.features.split(',').map((f: string) => f.trim());
        }
        
        return {
          ...p,
          image: imageUrl, // This is now a required property
          price: price,
          priceLabel: priceLabel,
          area: propertyArea,
          city: p.city || 'Dubai',
          location: location,
          beds: p.beds ?? 0,
          baths: p.baths ?? 0,
          sqft: p.sqft ?? 0,
          type: p.type || 'commercial',
          developer: p.developer || (p.developers?.name ? p.developers.name : null) || p.developer_id || null,
          featured: Boolean(p.featured),
          category: p.category || null,
          parking: p.parking || null,
          propertyAge: p.property_age || p.propertyAge || null,
          completion: p.completion || p.property_status || 'ready',
          subtype: p.subtype || null,
          description: p.description || null,
          features: featuresArray,
          video_url: p.video_url || null,
          currency: p.currency || 'AED',
          status: p.status || 'sale',
          agent_name: p.agent_name || null,
          review_status: p.review_status || null,
          submitted_at: p.submitted_at || null,
          collection: p.collection || 'properties',
          image_url: p.image_url || imageUrl // Add image_url for consistency
        } as NormalizedProperty;
      });
      
      console.log(`✅ Normalized ${normalized.length} ALL properties`);
      console.log('📊 Property types found:', [...new Set(normalized.map(p => p.type))]);
      setAllProperties(normalized);
      setLoading(false);
    }
    
    loadProperties();
  }, []);

  // Filter properties based on URL params
  useEffect(() => {
    if (allProperties.length === 0) return;
    
    let filtered = [...allProperties];
    
    // Filter by feature (property type)
    if (feature) {
      console.log(`🔍 Filtering by feature: ${feature}`);
      
      // Map URL features to property types
      const featureToTypeMap: Record<string, string[]> = {
        'townhouse': ['townhouse'],
        'villas': ['villa'],
        'apartments': ['apartment'],
        'commercial': ['commercial'],
        'plots': ['plot', 'residential-plot', 'industrial-plot'],
        'studios': ['furnished-studio'],
      };
      
      const typesToFilter = featureToTypeMap[feature] || [feature];
      filtered = filtered.filter(p => typesToFilter.includes(p.type));
      
      console.log(`📊 Found ${filtered.length} properties of type: ${typesToFilter.join(', ')}`);
    }
    
    // Filter by category (commercial ke liye special filters)
    if (category === 'commercial') {
      // Commercial specific filters - example: high price, office spaces, etc.
      filtered = filtered.filter(p => p.type === 'commercial');
    }
    
    setFilteredProperties(filtered);
  }, [allProperties, category, feature]);

  // Handle view change
  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    params.set('page', '1');
    router.push(`/commercial-properties?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/commercial-properties?${params.toString()}`);
  };

  // Handle filter click
  const handleFilterClick = (filterType: string, filterValue: string) => {
    const params = new URLSearchParams();
    if (filterType === 'category') {
      params.set('category', filterValue);
    } else if (filterType === 'feature') {
      params.set('feature', filterValue);
    }
    params.set('view', viewMode);
    params.set('page', '1');
    router.push(`/commercial-properties?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    params.set('view', viewMode);
    router.push(`/commercial-properties?${params.toString()}`);
  };

  // Pagination calculations
  const total = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (Math.max(page, 1) - 1) * limit;
  const paginatedProperties = filteredProperties.slice(offset, offset + limit);

  // Get page title based on filter
  const getPageTitle = () => {
    if (feature === 'townhouse') return 'Townhouses';
    if (feature === 'villas') return 'Villas';
    if (feature === 'apartments') return 'Apartments';
    if (feature === 'commercial') return 'Commercial Properties';
    if (feature === 'plots') return 'Plots & Land';
    if (feature === 'studios') return 'Furnished Studios';
    if (category === 'commercial') return 'Commercial Properties';
    return 'All Properties';
  };

  // Get page description based on filter
  const getPageDescription = () => {
    if (feature === 'townhouse') return 'Discover premium townhouses in Dubai with modern amenities and prime locations.';
    if (feature === 'villas') return 'Explore luxurious villas with private amenities and exclusive community access.';
    if (feature === 'apartments') return 'Find modern apartments with stunning views and convenient locations.';
    if (feature === 'commercial') return 'Commercial spaces for businesses seeking prime locations in Dubai.';
    if (feature === 'plots') return 'Available plots and land for residential and commercial development.';
    if (feature === 'studios') return 'Fully furnished studios with all amenities included for comfortable living.';
    if (category === 'commercial') return 'Discover premium commercial spaces in Dubai for your business needs. Offices, retail spaces, warehouses, and more.';
    return 'Discover Dubai\'s finest collection of ALL property types - Apartments, Villas, Townhouses, Commercial spaces and more.';
  };

  // Calculate agent properties count
  const agentPropertiesCount = filteredProperties.filter(p => p.collection === 'agent_properties').length;
  const mainPropertiesCount = filteredProperties.filter(p => p.collection === 'properties').length;

  if (loading) {
    return (
      <div className="min-h-screen 'bg-gradient-to-b' from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen 'bg-gradient-to-b' from-white-50 to-white">
      {/* View Details Modal */}
      {isModalOpen && selectedProperty && (
        <ViewDetailsModal 
          property={selectedProperty} 
          onClose={closeDetailsModal} 
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80" 
            alt="Commercial Building" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-white font-bold tracking-[0.3em] uppercase text-sm">
              {activeFilter ? getPageTitle() : 'ALL Properties Collection'}
            </h2>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight animate-slide-up [animation-delay:100ms]">
              {getPageTitle()}
            </h1>
            
            <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
              {getPageDescription()}
            </p>

            {/* Property Stats and Filter Info */}
            <div className="flex flex-wrap justify-center gap-3 pt-6 animate-slide-up [animation-delay:300ms]">
              <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                {total} Properties
              </span>
              
              {!activeFilter && (
                <span className="px-6 py-2 bg-green-500/20 backdrop-blur-md text-green-300 rounded-full border border-green-400/30 text-sm font-bold">
                  🏢 {new Set(allProperties.map(p => p.type)).size} Property Types
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8 sm:py-16">
        <div className="flex flex-col">
          {/* View Controls and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 bg-white p-4 sm:p-4 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-4 pl-4">
              <span className="text-black font-bold text-sm uppercase tracking-widest">
                {total} Properties 
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-blue-50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleViewChange('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-500' : 'text-blue-400 hover:text-blue-600'}`}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-500' : 'text-blue-400 hover:text-blue-600'}`}
                >
                  <QueueListIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length > 0 ? (
            <>
              <div className={`grid gap-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {paginatedProperties.map((property, i) => {
                  const typeInfo = getTypeInfo(property.type);
                  
                  return (
                    <div key={`${property.collection}-${property.id}`} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="relative group">
                        <PropertyCard
                          property={{
                            id: String(property.id),
                            title: property.title || 'Property',
                            price: property.price ?? 0,
                            priceLabel: property.status === 'rent' ? 'yearly' : 'total',
                            image: property.image, // This now exists on NormalizedProperty
                            location: property.location || `${property.area || ''}${property.city ? ', ' + property.city : ''}`,
                            beds: property.beds ?? 0,
                            baths: property.baths ?? 0,
                            sqft: property.sqft ?? 0,
                            type: property.type || 'Property',
                            featured: Boolean(property.featured),
                            currency: property.currency || 'AED',
                            status: property.status || 'sale',
                            area: property.area || undefined,
                            city: property.city || undefined,
                            video_url: property.video_url || undefined,
                            agent_name: property.agent_name || undefined,
                          } as PropertyCardProperty}
                        />
                        
                        {/* ADD VIEW DETAILS BUTTON */}
                        <button
                          onClick={() => handleViewDetails(property)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-blue-200 flex items-center gap-2 text-blue-700 hover:text-blue-600 font-bold text-sm z-10"
                        >
                          <ArrowsPointingOutIcon className="h-4 w-4" />
                          View Details
                        </button>
                        
                        {/* Property Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${typeInfo.color} text-white shadow-lg`}>
                            {typeInfo.emoji} {typeInfo.label}
                          </span>
                          {property.status === 'rent' ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                              🔑 For Rent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg">
                              🏠 For Sale
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-3 flex gap-2">
                        {property.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                        {property.collection === 'agent_properties' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🤝 Agent Property
                          </span>
                        )}
                        {property.agent_name && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            👤 {property.agent_name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all font-bold shadow-sm"
                    >
                      ←
                    </button>
                  )}

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`h-12 w-12 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
                            page === p 
                              ? 'bg-blue-500 text-white shadow-blue-500/20' 
                              : 'bg-white border border-blue-100 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="text-blue-300">...</span>;
                    }
                    return null;
                  })}

                  {page < totalPages && (
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all font-bold shadow-sm"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-blue-100 shadow-sm">
              <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BuildingOfficeIcon className="h-12 w-12 text-blue-300" />
              </div>
              <h3 className="text-2xl font-black text-blue-900 mb-2">No properties found</h3>
              <p className="text-blue-500 font-medium max-w-xs mx-auto">
                {activeFilter 
                  ? `No ${getPageTitle().toLowerCase()} available at the moment.`
                  : 'No properties available at the moment.'
                }
              </p>
              {activeFilter && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  View All Properties
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Simple CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Find Your {getPageTitle()}
            </h2>
            <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
              Browse our collection of premium properties from both our main listings and agent submissions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CommercialPropertiesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CommercialPropertiesPageContent />
    </Suspense>
  )
}