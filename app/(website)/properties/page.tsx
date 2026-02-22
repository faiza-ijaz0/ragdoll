'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Database } from '@/lib/database.types'
import MortgageCalculator from '@/components/shared/MortgageCalculator';
import PropertyCard, { PropertyCardProperty } from '@/components/property/PropertyCard'
import {
  ViewColumnsIcon,
  QueueListIcon,
  HomeIcon,
  SparklesIcon,
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
  ChevronRightIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  LanguageIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  StarIcon as StarOutlineIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  PhotoIcon,
  Squares2X2Icon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { 
  StarIcon as StarSolid, 
  BriefcaseIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import { 
  LinkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { BathIcon, BedIcon, CarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Firebase imports
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Import jsPDF for PDF generation
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Property = Database['public']['Tables']['properties']['Row']

// Agent Data Interface
interface AgentData {
  id?: string;
  title?: string;
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

type NormalizedProperty = Property & {
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
  agent_name?: string
  review_status?: string
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
  agent_image?: string
  agent_office?: string
  agent_experience?: number
  agent_properties?: number
  agent_phone?: string
  agent_whatsapp?: string
  views?: number
}

// Full Screen Gallery Component 
const FullScreenGallery = ({ 
  property, 
  onClose 
}: { 
  property: NormalizedProperty; 
  onClose: () => void 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Get all media (images + video) for the property
  const getPropertyMedia = () => {
    const media = []
    
    // Get all images
    if (property.images && property.images.length > 0) {
      property.images.forEach(img => {
        media.push({
          type: 'image',
          url: img,
          thumbnail: img
        })
      })
    } else if (property.image) {
      // Use main image if no images array
      media.push({
        type: 'image',
        url: property.image,
        thumbnail: property.image
      })
    }
    
    // Add video as last item if exists
    if (property.video_url) {
      const videoType = getVideoType(property.video_url);
      if (videoType !== 'none') {
        media.push({
          type: 'video',
          url: property.video_url,
          thumbnail: property.video_url
        })
      }
    }
    
    // If no media, add default
    if (media.length === 0) {
      media.push({
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'
      })
    }
    
    return media;
  }
  
  // Helper function to determine video type
  const getVideoType = (url: string) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url)) return 'direct';
    return 'external';
  }

  // Extract YouTube video ID
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
  
  const propertyMedia = getPropertyMedia();
  
  const handlePrev = () => {
    setCurrentIndex(prev => prev === 0 ? propertyMedia.length - 1 : prev - 1)
    setIsVideoPlaying(false)
    setIsZoomed(false)
    setImageLoaded(false)
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => prev === propertyMedia.length - 1 ? 0 : prev + 1)
    setIsVideoPlaying(false)
    setIsZoomed(false)
    setImageLoaded(false)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }
  
  const renderMedia = () => {
    const media = propertyMedia[currentIndex];
    if (!media) return null;
    
    if (media.type === 'video') {
      const videoType = getVideoType(media.url);
      
      if (videoType === 'youtube') {
        const videoId = extractYouTubeId(media.url);
        return isVideoPlaying ? (
          <div className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={`${property.title} - YouTube Video`}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={property.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              >
                <PlayCircleIcon className="w-12 h-12 text-white" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        )
      }
      
      else if (videoType === 'direct') {
        return (
          <div className="relative w-full h-full">
            <video
              key={media.url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain bg-black"
              preload="auto"
              playsInline
              controlsList="nodownload"
            >
              <source src={media.url} type={`video/${media.url.split('.').pop()?.split('?')[0]}`} />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        )
      }
      
      else {
        return (
          <div className="relative w-full h-full">
            <video
              key={media.url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain bg-black"
              preload="auto"
              playsInline
              controlsList="nodownload"
            >
              <source src={media.url} type="video/mp4" />
              <source src={media.url} type="video/webm" />
              <source src={media.url} type="video/ogg" />
              <source src={media.url} type="video/mov" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        )
      }
    }
    
    // Image display
    return (
      <div className="w-full h-full flex items-center justify-center">
        {!imageLoaded && !isZoomed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        <img
          src={media.url}
          alt={`${property.title} - Image ${currentIndex + 1}`}
          className={`transition-all duration-300 ${
            isZoomed 
              ? 'object-contain w-auto h-auto max-w-[2000px] max-h-[2000px] cursor-zoom-out' 
              : 'object-contain w-full h-full max-w-full max-h-full cursor-zoom-in'
          } ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          onClick={toggleZoom}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'
            setImageLoaded(true)
          }}
          style={{
            maxWidth: isZoomed ? '2000px' : '100%',
            maxHeight: isZoomed ? '2000px' : '100%',
          }}
        />
      </div>
    )
  }
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false)
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ' || e.key === 'Enter') toggleZoom();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isZoomed]);
  
  return (
    <div className="fixed inset-0 z-2000 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent">
        <div className="text-white">
          <h2 className="text-xl font-bold">{property.title}</h2>
          <p className="text-sm text-gray-300">
            {currentIndex + 1} / {propertyMedia.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleZoom}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7m6 0V7m0 3v3" />
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      
      {/* Main Media */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full max-w-7xl">
          {renderMedia()}
        </div>
      </div>
      
      {/* Navigation Arrows - Only show when not zoomed */}
      {propertyMedia.length > 1 && !isZoomed && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <ChevronLeftIcon className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <ChevronRightIcon className="w-8 h-8 text-white" />
          </button>
        </>
      )}
      
      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Click or press ESC to zoom out</span>
          </div>
        </div>
      )}
      
      {/* Thumbnails - Only show when not zoomed */}
      {propertyMedia.length > 1 && !isZoomed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
          <div className="flex gap-2 overflow-x-auto justify-center">
            {propertyMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsVideoPlaying(false);
                  setIsZoomed(false);
                  setImageLoaded(false);
                }}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-transparent hover:border-gray-400'
                }`}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                ) : (
                  <img
                    src={media.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Floor Plan Form Component - COMPLETED
function FloorPlanForm({
  property,
  onClose,
}: {
  property: NormalizedProperty;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    nationality: "",
    occupation: "",
    employerCompany: "",
    monthlyIncome: "",
    budgetRange: "",
    timeline: "",
    interestedInFinancing: false,
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);

  const getPropertyImages = () => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    if (property.floorplans && property.floorplans.length > 0) {
      return property.floorplans;
    }
    return [
      property.image ||
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop",
    ];
  };

  const propertyImages = getPropertyImages();

  useEffect(() => {
    async function fetchAgentData() {
      try {
        setAgentLoading(true);
        const agentId = property.agent_id;

        if (agentId) {
          const agentDocRef = doc(db, "agents", agentId);
          const agentDoc = await getDoc(agentDocRef);

          if (agentDoc.exists()) {
            const data = agentDoc.data() as AgentData;
            setAgentData(data);
            setAgentLoading(false);
            return;
          }
        }

        const agentName = property.agent_name;
        if (agentName) {
          const agentsRef = collection(db, "agents");
          const q = query(agentsRef, where("title", "==", agentName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as AgentData;
            setAgentData(data);
          } else {
            setAgentData({
              title: agentName || "Sarah Ahmed",
              office: "dubai",
              experience_years: 5,
              total_sales: 11,
              profile_image:
                "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
              whatsapp: "03291082882",
              verified: true,
              rating: 4.5,
              review_count: 0,
            });
          }
        } else {
          setAgentData({
            title: "Sarah Ahmed",
            office: "dubai",
            experience_years: 5,
            total_sales: 11,
            profile_image:
              "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
            whatsapp: "03291082882",
            verified: true,
            rating: 4.5,
            review_count: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setAgentData({
          title: property.agent_name || "Sarah Ahmed",
          office: "dubai",
          experience_years: 5,
          total_sales: 11,
          profile_image:
            "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
          whatsapp: "03291082882",
          verified: true,
          rating: 4.5,
          review_count: 0,
        });
      } finally {
        setAgentLoading(false);
      }
    }

    fetchAgentData();
  }, [property]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const floorplanData = {
        ...formData,
        property_id: property.id,
        property_title: property.title,
        property_price: property.price,
        property_location: property.location,
        submitted_at: serverTimestamp(),
        download_requested: true,
        status: "pending",
      };

      await addDoc(collection(db, "floorplans"), floorplanData);
      console.log("✅ Floor plan request saved to Firebase");
      generatePDF();
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("❌ Error saving floor plan request:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      doc.setFont("helvetica");
      doc.setFont("normal");
      doc.setFontSize(12);

      // Page 1: Cover Page
      doc.setFillColor(25, 50, 120);
      doc.rect(0, 0, 210, 50, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("PROPERTIES IN DUBAI", 105, 30, { align: "center" });
      doc.setFontSize(16);
      doc.text("Complete Property Information", 105, 45, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      const propertyTitle = property.title || "Property in Dubai";
      const splitTitle = doc.splitTextToSize(propertyTitle, 180);
      doc.text(splitTitle, 105, 80, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Type: ${property.type || "Property"}`, 105, 95, {
        align: "center",
      });

      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`AED ${formatPrice(property.price || 0)}${property.status === 'rent' ? '/year' : ''}`, 105, 120, {
        align: "center",
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const locationText =
        property.location || property.address || property.area || "Dubai, UAE";
      doc.text(locationText, 105, 140, { align: "center" });

      if (propertyImages.length > 0) {
        try {
          doc.addImage(propertyImages[0], "JPEG", 50, 150, 110, 80);
        } catch (error) {
          console.log("Image loading error:", error);
        }
      }

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Document ID: ${property.id || "N/A"}`, 105, 250, {
        align: "center",
      });
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US")}`,
        105, 260,
        { align: "center" }
      );

      // Add more pages
      doc.addPage();
      
      const fileName = `Property_Details_${
        property.title?.replace(/[^a-z0-9]/gi, "_") || "property"
      }_${Date.now()}.pdf`;
      doc.save(fileName);

      console.log("✅ PDF generated successfully!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };
  
  const budgetOptions = [
    "Select budget range",
    "Under 500,000 AED",
    "500,000 - 1,000,000 AED",
    "1,000,000 - 2,000,000 AED",
    "2,000,000 - 5,000,000 AED",
    "5,000,000 - 10,000,000 AED",
    "10,000,000+ AED",
  ];

  const timelineOptions = [
    "Select timeline",
    "Immediately",
    "Within 1 month",
    "Within 3 months",
    "Within 6 months",
    "Within 1 year",
    "Just exploring",
  ];

  if (submitted) {
    return (
      <div className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">
              Request Submitted Successfully!
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Your inquiry has been submitted. The PDF is downloading now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/50 overflow-y-auto p-4">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-white rounded-3xl max-w-4xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  Download Property Details
                </h3>
                <p className="text-gray-600">
                  Fill out the form for detailed property information
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Property Info */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {property.title}
                </h4>
                <p className="text-gray-600">{property.location}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-600">
                  AED {formatPrice(property.price || 0)}{property.status === 'rent' ? '/year' : ''}
                </div>
                <div className="text-gray-600">
                  {property.type} • {property.beds} Beds • {property.baths} Baths
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-black text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  <span className="text-blue-600">1.</span> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        Download Property Details & Submit Inquiry
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Agent Popup Modal Component - COMPLETED
function AgentPopupModal({
  agentData,
  isOpen,
  onClose,
}: {
  agentData: AgentData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !agentData) return null;

  const getWhatsAppUrl = (whatsapp: string | null): string => {
    if (!whatsapp) return '#';
    const cleanedNumber = whatsapp.replace(/\D/g, '');
    const finalNumber = cleanedNumber.startsWith('0') ? cleanedNumber.substring(1) : cleanedNumber;
    return `https://wa.me/971${finalNumber}`;
  };

  const formatAgentDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:text-primary hover:bg-white transition-all shadow-lg"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-0">
          <div className="relative h-64 md:h-80 bg-linear-to-r from-primary/20 to-secondary/20">
            {agentData?.profile_image ? (
              <img
                src={agentData.profile_image}
                alt={agentData.title || "Agent"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                <div className="text-6xl font-bold text-primary opacity-50">
                  {agentData?.title ? agentData.title.substring(0, 2).toUpperCase() : 'AG'}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">
                    {agentData?.title || "Real Estate Agent"}
                  </h2>
                  <p className="text-white/80 text-lg">{agentData?.brokerage || "Property Specialist"}</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  {agentData?.verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                      <CheckBadgeIcon className="w-4 h-4" />
                      Verified Agent
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-secondary text-sm font-bold rounded-full">
                    <BriefcaseIcon className="w-4 h-4" />
                    {agentData?.experience_years || 5}+ Years
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    {agentData?.whatsapp && (
                      <a
                        href={getWhatsAppUrl(agentData.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">WhatsApp</div>
                          <div className="text-sm">{agentData.whatsapp}</div>
                        </div>
                      </a>
                    )}

                    {agentData?.telegram && (
                      <a
                        href={`https://t.me/${agentData.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <PaperClipIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">Telegram</div>
                          <div className="text-sm">{agentData.telegram}</div>
                        </div>
                      </a>
                    )}

                    {agentData?.linkedin_url && (
                      <a
                        href={agentData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">LinkedIn</div>
                          <div className="text-sm truncate">View Profile</div>
                        </div>
                      </a>
                    )}

                    {agentData?.website_url && (
                      <a
                        href={agentData.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <GlobeAltIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">Website</div>
                          <div className="text-sm truncate">Visit Website</div>
                        </div>
                      </a>
                    )}

                    {agentData?.instagram_handle && (
                      <a
                        href={`https://instagram.com/${agentData.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Instagram</div>
                          <div className="text-sm">@{agentData.instagram_handle.replace('@', '')}</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">License No:</span>
                      <span className="font-semibold text-secondary">{agentData?.license_no || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">Office:</span>
                      <span className="font-semibold text-secondary">{agentData?.office || 'Dubai'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">Location:</span>
                      <span className="font-semibold text-secondary">{agentData?.location || 'Dubai'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">Commission:</span>
                      <span className="font-semibold text-secondary">{agentData?.commission_rate || 2.5}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Total Sales:</span>
                      <span className="font-semibold text-secondary">
                        {agentData?.total_sales?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-2">Agent Rating</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarSolid 
                              key={i} 
                              className={`w-5 h-5 ${i < Math.floor(agentData?.rating || 0) ? 'text-yellow-500' : 'text-slate-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-secondary">
                          {(agentData?.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-slate-500">
                          ({agentData?.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">
                          {agentData?.approved ? 'Verified Agent' : 'Pending Verification'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {agentData?.bio && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-secondary mb-2">About Me</h4>
                      <p className="text-slate-600 leading-relaxed">{agentData.bio}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-primary" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(agentData?.specializations || ['Residential', 'Commercial']).map((spec: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-primary" />
                      Areas Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(agentData?.areas || ['Dubai']).map((area: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm font-semibold rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                      <LanguageIcon className="w-5 h-5 text-primary" />
                      Languages
                    </h3>
                    <div className="space-y-2">
                      {(agentData?.languages || ['English', 'Arabic']).map((lang: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-700">{lang}</span>
                          <span className="text-sm text-slate-500">Fluent</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                      <CheckBadgeIcon className="w-5 h-5 text-primary" />
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {(agentData?.certifications || ['RERA Certified']).map((cert: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-slate-700 font-medium">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-secondary mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Agent ID</p>
                      <p className="font-mono text-sm text-secondary">{agentData?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Member Since</p>
                      <p className="font-semibold text-secondary">
                        {agentData?.created_at ? formatAgentDate(agentData.created_at) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="font-semibold text-secondary">
                        {agentData?.updated_at ? formatAgentDate(agentData.updated_at) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <p className="font-semibold text-green-600">
                        {agentData?.approved ? 'Active' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={getWhatsAppUrl(agentData?.whatsapp || null)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${agentData?.whatsapp || ''}`}
                  className="flex-1 bg-primary text-secondary py-3 px-6 rounded-xl font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Call Now
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-bold text-center hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN VIEW DETAILS MODAL - COMPLETED
function ViewDetailsModal({ 
  property, 
  onClose 
}: { 
  property: NormalizedProperty | null; 
  onClose: () => void 
}) {
  if (!property) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mortgageData, setMortgageData] = useState({
    downPaymentPercent: 20,
    interestRate: 4.5,
    loanTerm: 25,
  });
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [showFloorPlanForm, setShowFloorPlanForm] = useState(false);
  const [showAgentPopup, setShowAgentPopup] = useState(false);
  const [agentPopupData, setAgentPopupData] = useState<AgentData | null>(null);
  const [agentPopupLoading, setAgentPopupLoading] = useState(false);
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);

  // Fetch agent data
  useEffect(() => {
    async function fetchAgentData() {
      try {
        setAgentLoading(true);
        const agentId = property?.agent_id;

        if (agentId) {
          const agentDocRef = doc(db, "agents", agentId);
          const agentDoc = await getDoc(agentDocRef);

          if (agentDoc.exists()) {
            const data = agentDoc.data() as AgentData;
            setAgentData(data);
            setAgentLoading(false);
            return;
          }
        }

        const agentName = property?.agent_name;
        if (agentName) {
          const agentsRef = collection(db, "agents");
          const q = query(agentsRef, where("title", "==", agentName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as AgentData;
            setAgentData(data);
          } else {
            setAgentData({
              title: agentName || "Sarah Ahmed",
              office: "dubai",
              experience_years: 5,
              total_sales: 11,
              profile_image:
                "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
              whatsapp: "03291082882",
              verified: true,
              rating: 4.5,
              review_count: 0,
            });
          }
        } else {
          setAgentData({
            title: "Sarah Ahmed",
            office: "dubai",
            experience_years: 5,
            total_sales: 11,
            profile_image:
              "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
            whatsapp: "03291082882",
            verified: true,
            rating: 4.5,
            review_count: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setAgentData({
          title: property?.agent_name || "Sarah Ahmed",
          office: "dubai",
          experience_years: 5,
          total_sales: 11,
          profile_image:
            "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
          whatsapp: "03291082882",
          verified: true,
          rating: 4.5,
          review_count: 0,
        });
      } finally {
        setAgentLoading(false);
      }
    }

    if (property) {
      fetchAgentData();
    }
  }, [property]);

  const openAgentPopup = async () => {
    try {
      setAgentPopupLoading(true);
      
      if (property.agent_id) {
        const agentDocRef = doc(db, "agents", property.agent_id);
        const agentDoc = await getDoc(agentDocRef);
        
        if (agentDoc.exists()) {
          const data = agentDoc.data() as AgentData;
          setAgentPopupData({
            id: agentDoc.id,
            ...data
          });
          setShowAgentPopup(true);
          document.body.style.overflow = 'hidden';
          setAgentPopupLoading(false);
          return;
        }
      }
      
      if (property.agent_name) {
        const agentsRef = collection(db, "agents");
        const q = query(agentsRef, where("title", "==", property.agent_name));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as AgentData;
          setAgentPopupData({
            id: doc.id,
            ...data
          });
          setShowAgentPopup(true);
          document.body.style.overflow = 'hidden';
          setAgentPopupLoading(false);
          return;
        }
      }
      
      if (agentData) {
        setAgentPopupData(agentData);
        setShowAgentPopup(true);
        document.body.style.overflow = 'hidden';
        setAgentPopupLoading(false);
        return;
      }
      
      setAgentPopupData({
        title: property.agent_name || "Agent",
        office: "dubai",
        experience_years: 5,
        total_sales: 11,
        profile_image: "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
        whatsapp: "03291082882",
        verified: true,
        rating: 4.5,
        review_count: 0,
      });
      setShowAgentPopup(true);
      document.body.style.overflow = 'hidden';
      
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setAgentPopupData({
        title: property.agent_name || "Agent",
        office: "dubai",
        experience_years: 5,
        total_sales: 11,
        profile_image: "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
        whatsapp: "03291082882",
        verified: true,
        rating: 4.5,
        review_count: 0,
      });
      setShowAgentPopup(true);
      document.body.style.overflow = 'hidden';
    } finally {
      setAgentPopupLoading(false);
    }
  };

  const closeAgentPopup = () => {
    setShowAgentPopup(false);
    setAgentPopupData(null);
    document.body.style.overflow = 'auto';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPropertyImages = () => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    if (property.floorplans && property.floorplans.length > 0) {
      return property.floorplans;
    }
    return [
      property.image ||
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop",
    ];
  };

  const propertyImages = getPropertyImages();

  const calculateMortgage = () => {
    const price = property.price || 0;
    const downPayment = price * (mortgageData.downPaymentPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = mortgageData.interestRate / 100 / 12;
    const totalPayments = mortgageData.loanTerm * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }

    return {
      downPayment,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
    };
  };

  const mortgage = calculateMortgage();

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      {showFloorPlanForm && (
        <FloorPlanForm
          property={property}
          onClose={() => setShowFloorPlanForm(false)}
        />
      )}

      {showAgentPopup && agentPopupData && (
        <AgentPopupModal
          agentData={agentPopupData}
          isOpen={showAgentPopup}
          onClose={closeAgentPopup}
        />
      )}

      {/* Full Screen Gallery */}
      {showFullScreenGallery && (
        <FullScreenGallery 
          property={property} 
          onClose={() => setShowFullScreenGallery(false)} 
        />
      )}

      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
          <div className="container-custom py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm font-bold text-slate-700">
                  Back to Properties
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Save Property
                </button>
                <button className="px-5 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom pt-8 pb-12">
          <div className="flex flex-row gap-3 mb-6">
            <div className="-mt-1">
              <button
                onClick={onClose}
                className="h-10 w-10 mb-2 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xl mb-2 font-bold text-slate-500">Properties in Dubai</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-8 space-y-12">
              {/* Main Image Gallery */}
              <div className="overflow-hidden shadow-2xl rounded-3xl shadow-slate-200/50">
                <div className="relative h-[500px] bg-slate-100 overflow-hidden">
                  <img
                    src={propertyImages[currentImageIndex]}
                    alt={property.title || "Property Image"}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowFullScreenGallery(true)}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop";
                    }}
                  />

                  {/* Open Gallery Button */}
                  <button
                    onClick={() => setShowFullScreenGallery(true)}
                    className="absolute bottom-6 right-6 bg-black/70 hover:bg-black/90 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-colors backdrop-blur-sm shadow-lg z-10"
                  >
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                    <span className="font-bold text-sm">Open Gallery</span>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className="flex gap-2">
                      <span className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg">
                        {property.status === "rent" ? "FOR RENT" : "FOR SALE"}
                      </span>
                      {property.featured && (
                        <span className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full shadow-lg">
                          FEATURED
                        </span>
                      )}
                      <span className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full shadow-lg">
                        {property.property_status?.toUpperCase() || "READY"}
                      </span>
                    </div>

                    <div className="absolute top-2 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full flex items-center gap-1 z-20">
                      <PhotoIcon className="w-4 h-4" />
                      {currentImageIndex + 1} / {propertyImages.length}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {propertyImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors shadow-xl"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-white" />
                      </button>

                      <button
                        onClick={handleNextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors shadow-xl"
                      >
                        <ChevronRightIcon className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {propertyImages.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {propertyImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`shrink-0 w-24 h-20 rounded-xl overflow-hidden border-4 transition-all ${
                            idx === currentImageIndex
                              ? "border-primary"
                              : "border-transparent hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details Card */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-10">
                  {/* Title and Price */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                          {property.type?.toUpperCase() || "PROPERTY"}
                        </span>
                        <span className="px-4 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                          {property.property_status?.toUpperCase() || "READY"}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        {property.title || "Property in Dubai"}
                      </h1>
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <MapPinIcon className="w-5 h-5 text-primary" />
                        <span>
                          {property.address ||
                            property.location ||
                            `${property.area || ""}${
                              property.city ? ", " + property.city : ""
                            }`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {property.status === "rent" ? "YEARLY RENT" : "PRICE"}
                      </div>
                      <div className="text-4xl md:text-5xl font-black text-primary">
                        AED {formatPrice(property.price || 0)}
                        {property.status === "rent" ? "/year" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="flex gap-20 justify-around p-8 bg-slate-50 rounded-4xl border border-slate-100">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        BEDROOMS
                      </div>
                      <div className="flex items-center gap-2">
                        <HomeIcon className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-black text-slate-900">
                          {property.beds || 0}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        BATHROOMS
                      </div>
                      <div className="flex items-center gap-2">
                        <Square3Stack3DIcon className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-black text-slate-900">
                          {property.baths || 0}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        TOTAL AREA
                      </div>
                      <div className="flex items-center gap-2">
                        <Square3Stack3DIcon className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-black text-slate-900">
                          {formatNumber(property.sqft || 0)}
                          <span className="text-xs font-bold text-slate-400 ml-1 uppercase">
                            SQFT
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <DocumentTextIcon className="w-5 h-5" />
                      </span>
                      Description
                    </h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        {property.description ||
                          "Experience comfortable living in this property located in Dubai. This residence offers modern amenities and convenient location."}
                      </p>
                    </div>
                  </div>

                  {/* Features & Amenities */}
                  {property.features && property.features.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <SparklesIcon className="w-5 h-5" />
                        </span>
                        Features & Amenities
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300"
                          >
                            <CheckCircleIcon className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-slate-700 font-bold text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Details Grid */}
                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <ChartBarIcon className="w-5 h-5" />
                      </span>
                      Property Details
                    </h2>
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        <div className="space-y-6">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              PROPERTY TYPE
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                              {property.type || "Property"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              AREA
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                              {property.area || "Dubai"}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              STATUS
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                              {property.property_status || "Ready"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              CITY
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                              {property.city || "Dubai"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Map */}
                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <MapPinIcon className="w-5 h-5" />
                      </span>
                      Location Map
                    </h2>
                    <div className="bg-gray-100 rounded-[2.5rem] h-[500px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative">
                      <div className="w-full h-full">
                        <iframe
                          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462562.65095637795!2d54.94728926249997!3d25.07575955953261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1690465000000!5m2!1sen!2s`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Property Location Map"
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
                                {property.address ||
                                  property.location ||
                                  `${property.area || ""}${
                                    property.city ? ", " + property.city : ""
                                  }`}
                              </div>
                              <div className="text-slate-600 text-sm">
                                {property.coords
                                  ? `Lat: ${property.coords.lat.toFixed(
                                      6
                                    )}, Lng: ${property.coords.lng.toFixed(6)}`
                                  : "Dubai, United Arab Emirates"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Resources */}
                  <div className="space-y-6 pt-10 border-t border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <DocumentTextIcon className="w-5 h-5" />
                      </span>
                      Download Resources
                    </h2>
                    <p className="text-slate-600 text-lg">
                      Get detailed information about this property.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        onClick={() => setShowFloorPlanForm(true)}
                        className="group p-6 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-2xl transition-all duration-300 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-primary group-hover:text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-white">
                              Download Brochure
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-white/80">
                              Complete property information
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowFloorPlanForm(true)}
                        className="group p-6 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-2xl transition-all duration-300 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-primary group-hover:text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-white">
                              Floor Plan
                            </h3>
                            <p className="text-sm text-slate-600 group-hover:text-white/80">
                              Detailed layout and dimensions
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Agent & Actions */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-32 space-y-8">
                {/* Agent Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                  <div className="text-center space-y-6">
                    {agentLoading ? (
                      <div className="animate-pulse">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-300 mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <div className="relative inline-block">
                          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-slate-50 shadow-lg">
                            <img
                              src={
                                agentData?.profile_image ||
                                "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg"
                              }
                              alt={agentData?.title || "Agent"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg";
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                            <span className="text-[10px] font-black text-slate-900">
                              {agentData?.rating
                                ? agentData.rating.toFixed(1)
                                : "4.5"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">
                            {agentData?.title ||
                              property.agent_name ||
                              "Sarah Ahmed"}
                          </h3>
                          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
                            {agentData?.office
                              ? `${agentData.office.toUpperCase()} OFFICE`
                              : "DUBAI OFFICE"}
                          </p>
                          {agentData?.verified && (
                            <div className="mt-2 flex items-center gap-1 justify-center">
                              <ShieldCheckIcon className="h-4 w-4 text-primary" />
                              <span className="text-xs text-primary font-medium">
                                Verified Agent
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                          <div className="text-center">
                            <div className="text-lg font-black text-slate-900">
                              {agentData?.experience_years
                                ? `${agentData.experience_years}+`
                                : "5+"}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              YEARS EXP.
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-black text-slate-900">
                              {agentData?.total_sales
                                ? `${agentData.total_sales}+`
                                : "11+"}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              PROPERTIES
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              const phone = agentData?.whatsapp || "03291082882";
                              window.location.href = `tel:${phone}`;
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                          >
                            <PhoneIcon className="w-5 h-5" />
                            Call Agent
                          </button>
                          <button
                            onClick={() => {
                              const phone =
                                agentData?.whatsapp || "03291082882";
                              window.open(`https://wa.me/${phone}`, "_blank");
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            WhatsApp
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      onClick={openAgentPopup}
                      disabled={agentPopupLoading}
                      className="w-full inline-block text-center text-slate-400 font-bold hover:text-primary transition-colors cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {agentPopupLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Loading...
                        </div>
                      ) : (
                        'VIEW FULL PROFILE'
                      )}
                    </button>
                  </div>
                </div>

                {/* Inquiry Form */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-black tracking-tight">
                      Interested in this Property?
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Fill out the form below for inquiries.
                    </p>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                      />
                      <textarea
                        rows={3}
                        placeholder="Your Message"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                      >
                        Send Inquiry
                      </button>
                    </form>
                  </div>
                </div>

                {/* Mortgage Calculator */}
                <MortgageCalculator defaultPrice={property.price || 0} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// Function to fetch property details
async function fetchPropertyDetails(
  propertyId: string,
  collectionName: string
): Promise<Record<string, any> | null> {
  try {
    const docRef = doc(db, collectionName, propertyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        collection: collectionName,
        ...data,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching property details:`, error);
    return null;
  }
}

// Function to fetch ALL properties from 'properties' collection (NO FILTERS)
async function fetchAllPropertiesFromMainCollection() {
  try {
    const propertiesRef = collection(db, 'properties');
    
    // NO WHERE CLAUSE - fetch ALL properties
    const q = query(propertiesRef);
    
    const querySnapshot = await getDocs(q);
    
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
    console.error('Error fetching from main collection:', error.message);
    return [];
  }
}

// Function to fetch ALL properties from 'agent_properties' collection
async function fetchAllPropertiesFromAgentCollection() {
  try {
    const agentPropertiesRef = collection(db, 'agent_properties');
    
    // NO WHERE CLAUSE - fetch ALL published properties
    const q = query(agentPropertiesRef);
    
    const querySnapshot = await getDocs(q);
    
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
    console.error('Error fetching from agent collection:', error.message);
    return [];
  }
}

// Main function to fetch ALL properties from both collections (NO FILTERS)
async function fetchAllProperties() {
  try {
    const [mainProperties, agentProperties] = await Promise.all([
      fetchAllPropertiesFromMainCollection(),
      fetchAllPropertiesFromAgentCollection()
    ]);
    
    const allProperties = [...mainProperties, ...agentProperties];
    
    console.log(`📊 Total properties fetched: ${allProperties.length}`);
    console.log('📊 Status breakdown:', {
      sale: allProperties.filter(p => p.status === 'sale').length,
      rent: allProperties.filter(p => p.status === 'rent').length,
      other: allProperties.filter(p => p.status !== 'sale' && p.status !== 'rent').length
    });
    
    return allProperties;
    
  } catch (error) {
    console.error('Error in fetchAllProperties:', error);
    return [];
  }
}

function PropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allProperties, setAllProperties] = useState<NormalizedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<NormalizedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<NormalizedProperty | null>(null);
  const [galleryModal, setGalleryModal] = useState<{ isOpen: boolean; property: NormalizedProperty | null }>({ isOpen: false, property: null });
  const [showFullScreenGallery, setShowFullScreenGallery] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const action = searchParams.get('action') || 'all';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const area = searchParams.get('area') || '';
  const developer = searchParams.get('developer') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const beds = searchParams.get('beds') || '';
  const baths = searchParams.get('baths') || '';
  const minSqft = searchParams.get('minSqft') || '';
  const maxSqft = searchParams.get('maxSqft') || '';
  const furnished = searchParams.get('furnished') || '';
  const parking = searchParams.get('parking') || '';
  const propertyAge = searchParams.get('propertyAge') || '';
  const completion = searchParams.get('completion') || '';
  const features = searchParams.get('features') || '';
  const subtype = searchParams.get('subtype') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const search = searchParams.get('search') || '';
  const hasVideo = searchParams.get('hasVideo') || '';

  // Form state - initial values from URL params
  const [formState, setFormState] = useState({
    action: action,
    category: category,
    type: type,
    area: area,
    minPrice: minPrice,
    maxPrice: maxPrice,
    beds: beds,
    baths: baths,
    furnished: furnished,
    completion: completion,
    hasVideo: hasVideo,
    search: search
  });

  // Update formState when URL params change
  useEffect(() => {
    console.log('🔍 URL Params:', {
      action: searchParams.get('action'),
      area: searchParams.get('area'),
      type: searchParams.get('type')
    });
    
    setFormState({
      action: searchParams.get('action') || 'all',
      category: searchParams.get('category') || '',
      type: searchParams.get('type') || '',
      area: searchParams.get('area') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      beds: searchParams.get('beds') || '',
      baths: searchParams.get('baths') || '',
      furnished: searchParams.get('furnished') || '',
      completion: searchParams.get('completion') || '',
      hasVideo: searchParams.get('hasVideo') || '',
      search: searchParams.get('search') || ''
    });
  }, [searchParams]);

  const handleViewDetails = async (property: NormalizedProperty) => {
    try {
      const detailedProperty = await fetchPropertyDetails(
        property.id,
        property.collection || 'properties'
      );
      
      if (detailedProperty) {
        const normalized = {
          ...detailedProperty,
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
          agent_image: detailedProperty.profile_image ||
            "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
          agent_office: detailedProperty.office || "DUBAI OFFICE",
          agent_experience: detailedProperty.experience_years || 8,
          agent_properties: detailedProperty.total_sales || 150,
          agent_phone: detailedProperty.phone || "03291082882",
          agent_whatsapp: detailedProperty.whatsapp || "03291082882",
          views: detailedProperty.views || 1250,
        };
        
        setSelectedProperty(normalized as NormalizedProperty);
      } else {
        setSelectedProperty(property);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      setSelectedProperty(property);
    }
  };

  const handleGalleryOpenFromThumbnail = (property: NormalizedProperty) => {
    setGalleryModal({ isOpen: true, property: property });
  };

  const closeDetailsModal = () => {
    setSelectedProperty(null);
    setShowFullScreenGallery(false);
  };

  // Load ALL properties once on mount (NO FILTERS)
  useEffect(() => {
    async function loadProperties() {
      const properties = await fetchAllProperties();
      
      const normalized = properties.map((p: any) => {
        let imageUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop';
        
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
          imageUrl = p.images[0];
        } else if (p.image) {
          imageUrl = p.image;
        } else if (p.image_url) {
          imageUrl = p.image_url;
        }
        
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
        const location = p.location || p.address || p.area || p.city || 'Dubai';
        const completionStatus = p.completion || p.property_status || 'ready';
        const propertyArea = p.area || p.location || p.address || p.neighborhood || p.district || 'Dubai';
        
        let featuresArray: string[] = [];
        if (Array.isArray(p.features)) {
          featuresArray = p.features;
        } else if (typeof p.features === 'string') {
          featuresArray = p.features.split(',').map((f: string) => f.trim());
        }
        
        return {
          ...p,
          image: imageUrl,
          price: price,
          priceLabel: p.status === 'rent' ? 'yearly' : 'total',
          area: propertyArea,
          city: p.city || 'Dubai',
          location: location,
          beds: p.beds ?? 0,
          baths: p.baths ?? 0,
          sqft: p.sqft ?? 0,
          type: p.type || p.subtype || 'Property',
          developer: p.developer || (p.developers?.name ? p.developers.name : null) || p.developer_id || null,
          featured: Boolean(p.featured),
          category: p.category || null,
          parking: p.parking || null,
          propertyAge: p.property_age || p.propertyAge || null,
          completion: completionStatus,
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
          agent_image: p.profile_image ||
            "https://img.freepik.com/free-photo/blond-businessman-happy-expression_1194-3866.jpg",
          agent_office: p.office || "DUBAI OFFICE",
          agent_experience: p.experience_years || 8,
          agent_properties: p.total_sales || 150,
          agent_phone: p.phone || "03291082882",
          agent_whatsapp: p.whatsapp || "03291082882",
          views: p.views || 1250,
        };
      });
      
      setAllProperties(normalized);
      setDataLoaded(true);
    }
    
    loadProperties();
  }, []);

  // Apply filters locally - NO REDIRECT
  useEffect(() => {
    if (!dataLoaded || allProperties.length === 0) {
      setFilteredProperties([]);
      return;
    }
    
    let filtered = [...allProperties];
    
    console.log('🔍 Before any filter:', filtered.length);
    
    // Filter by action (rent/buy/all) - BUT ALL shows everything
    if (formState.action === 'rent') {
      filtered = filtered.filter(p => p.status === 'rent');
      console.log('🔍 After rent filter:', filtered.length);
    } else if (formState.action === 'buy' || formState.action === 'sale') {
      filtered = filtered.filter(p => p.status === 'sale');
      console.log('🔍 After sale filter:', filtered.length);
    }
    // 'all' shows everything - no filter

    // Filter by category (but category filter is OPTIONAL)
    if (formState.category) {
      filtered = filtered.filter(p => p.category === formState.category);
      console.log('🔍 After category filter:', filtered.length);
    }

    // Filter by property type
    if (formState.type) {
      filtered = filtered.filter(p => p.type?.toLowerCase() === formState.type.toLowerCase());
      console.log('🔍 After type filter:', filtered.length);
    }

    // Filter by area/location
    if (formState.area) {
      const searchPhrase = formState.area.replace(/-/g, ' ').toLowerCase();
      const searchTerms = searchPhrase.split(' ').filter(term => term.length > 0);
      
      filtered = filtered.filter(p => {
        const locationFields = [
          p.area,
          p.city,
          p.location,
          p.address,
          p.neighborhood,
          p.district
        ];
        
        const locationText = locationFields
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        const exactMatch = locationText.includes(searchPhrase);
        const allTermsMatch = searchTerms.every(term => locationText.includes(term));
        
        return exactMatch || allTermsMatch;
      });
      console.log('🔍 After area filter:', filtered.length);
    }

    // Filter by developer
    if (developer) {
      filtered = filtered.filter(p => p.developer?.toLowerCase().includes(developer.toLowerCase()));
    }

    // Filter by price range
    if (formState.minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(formState.minPrice));
    }
    if (formState.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(formState.maxPrice));
    }

    // Filter by bedrooms
    if (formState.beds) {
      const bedNum = parseInt(formState.beds);
      if (formState.beds === '5') {
        filtered = filtered.filter(p => p.beds >= 5);
      } else {
        filtered = filtered.filter(p => p.beds === bedNum);
      }
    }

    // Filter by bathrooms
    if (formState.baths) {
      const bathNum = parseInt(formState.baths);
      if (formState.baths === '5') {
        filtered = filtered.filter(p => p.baths >= 5);
      } else {
        filtered = filtered.filter(p => p.baths === bathNum);
      }
    }

    // Filter by size range
    if (minSqft) {
      filtered = filtered.filter(p => p.sqft >= parseInt(minSqft));
    }
    if (maxSqft) {
      filtered = filtered.filter(p => p.sqft <= parseInt(maxSqft));
    }

    // Filter by furnished
    if (formState.furnished === 'true') {
      filtered = filtered.filter(p => p.furnished === true);
    } else if (formState.furnished === 'false') {
      filtered = filtered.filter(p => p.furnished === false || p.furnished === null);
    }

    // Filter by parking
    if (parking) {
      filtered = filtered.filter(p => p.parking?.toLowerCase() === parking.toLowerCase());
    }

    // Filter by property age
    if (propertyAge) {
      filtered = filtered.filter(p => p.propertyAge === propertyAge);
    }

    // Filter by completion status
    if (formState.completion) {
      filtered = filtered.filter(p => p.completion === formState.completion);
    }

    // Filter by video availability
    if (formState.hasVideo === 'true') {
      filtered = filtered.filter(p => p.video_url && p.video_url.trim() !== '');
    }

    // Filter by features
    const featuresList = features ? features.split(',').map(f => f.trim()).filter(Boolean) : [];
    if (featuresList.length > 0) {
      filtered = filtered.filter((p: NormalizedProperty) => {
        if (!p.features || !Array.isArray(p.features)) return false;
        return featuresList.every(f => (p.features || []).includes(f));
      });
    }

    // Keywords search - Property name search
    if (formState.search && formState.search.trim() !== '') {
      const sLower = formState.search.toLowerCase();
      filtered = filtered.filter(p => {
        const inTitle = p.title?.toLowerCase().includes(sLower);
        const inLocation = p.location?.toLowerCase().includes(sLower);
        const inArea = (p.area || '').toLowerCase().includes(sLower);
        const inDesc = (p.description || '').toLowerCase().includes(sLower);
        const inDeveloper = ((p.developer || '') as string).toLowerCase().includes(sLower);
        const inAgentName = ((p.agent_name || '') as string).toLowerCase().includes(sLower);
        return inTitle || inLocation || inArea || inDesc || inDeveloper || inAgentName;
      });
    }

    // Sort results
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.submitted_at || a.created_at || '0';
          const dateB = b.submitted_at || b.created_at || '0';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) {
            return Number(b.featured) - Number(a.featured);
          }
          const dateA = a.submitted_at || a.created_at || '0';
          const dateB = b.submitted_at || b.created_at || '0';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        break;
    }

    console.log('🔍 Final filtered count:', filtered.length);
    setFilteredProperties(filtered);
  }, [
    dataLoaded, allProperties, formState, developer, minSqft, maxSqft, 
    parking, propertyAge, features, sortBy
  ]);

  const handleInputChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FILTER APPLY - WITHOUT REDIRECT
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFormState({
      action: 'all',
      category: '',
      type: '',
      area: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: '',
      furnished: '',
      completion: '',
      hasVideo: '',
      search: ''
    });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    router.replace(`/luxe?${params.toString()}`, { scroll: false });
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.replace(`/luxe?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`/luxe?${params.toString()}`, { scroll: false });
  };

  const getPageTitle = () => {
    let title = '';

    if (formState.action === 'rent') {
      title += 'Properties for Rent';
    } else if (formState.action === 'buy' || formState.action === 'sale') {
      title += 'Properties for Sale';
    } else {
      title += 'All Properties';
    }

    if (formState.category) {
      title = formState.category.charAt(0).toUpperCase() + formState.category.slice(1) + ' ' + title;
    }

    if (formState.type) {
      const typeLabels: Record<string, string> = {
        apartment: 'Apartments',
        villa: 'Villas',
        townhouse: 'Townhouses',
        penthouse: 'Penthouses',
        studio: 'Studios',
        plot: 'Plots',
        commercial: 'Commercial Properties'
      };
      title = typeLabels[formState.type] || formState.type.charAt(0).toUpperCase() + formState.type.slice(1) + 's';
    }

    title += formState.area ? ` in ${formState.area}` : ' in Dubai';

    return title;
  };

  const getPageDescription = () => {
    let desc = '';

    if (formState.action === 'rent') {
      desc += 'Find ';
    } else if (formState.action === 'buy' || formState.action === 'sale') {
      desc += 'Discover ';
    } else {
      desc += 'Browse ';
    }

    if (formState.category) {
      desc += formState.category + ' ';
    }

    if (formState.type) {
      const typeLabels: Record<string, string> = {
        apartment: 'apartments',
        villa: 'villas',
        townhouse: 'townhouses',
        penthouse: 'penthouses',
        studio: 'studios',
        plot: 'plots',
        commercial: 'commercial properties'
      };
      desc += typeLabels[formState.type] || formState.type + 's';
    } else {
      desc += 'properties';
    }

    if (formState.action === 'rent') {
      desc += ' for rent';
    } else if (formState.action === 'buy' || formState.action === 'sale') {
      desc += ' for sale';
    }

    desc += formState.area ? ` in ${formState.area}, Dubai` : ' in Dubai';
    desc += '. Browse our curated selection with detailed information and high-quality images.';

    return desc;
  };

  const total = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (Math.max(page, 1) - 1) * limit;
  const paginatedProperties = filteredProperties.slice(offset, offset + limit);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Show a simple message while loading
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {selectedProperty && (
        <ViewDetailsModal 
          property={selectedProperty} 
          onClose={closeDetailsModal} 
        />
      )}

      {/* Gallery Modal from thumbnail */}
      {galleryModal.isOpen && galleryModal.property && (
        <FullScreenGallery 
          property={galleryModal.property} 
          onClose={() => setGalleryModal({ isOpen: false, property: null })} 
        />
      )}

      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80" 
            alt="Dubai Skyline" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-900/80 to-slate-900" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-primary font-bold tracking-[0.3em] uppercase text-sm animate-slide-up">
              {formState.action === 'rent' ? 'RENTAL' : formState.action === 'buy' ? 'SALES' : 'ALL'} PROPERTIES
            </h2>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight animate-slide-up [animation-delay:100ms]">
              {getPageTitle()}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
              {getPageDescription()}
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4 animate-slide-up [animation-delay:300ms]">
              <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                {total} Properties Found
              </span>
              {formState.search && (
                <span className="px-6 py-2 bg-primary/20 backdrop-blur-md text-primary rounded-full border border-primary/30 text-sm font-bold">
                  🔎 &ldquo;{formState.search}&rdquo;
                </span>
              )}
              {formState.area && (
                <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                  📍 {formState.area}
                </span>
              )}
              {formState.action === 'rent' && (
                <span className="px-6 py-2 bg-green-500/20 backdrop-blur-md text-green-500 rounded-full border border-green-500/30 text-sm font-bold">
                  🏠 For Rent
                </span>
              )}
              {formState.action === 'buy' && (
                <span className="px-6 py-2 bg-blue-500/20 backdrop-blur-md text-blue-500 rounded-full border border-blue-500/30 text-sm font-bold">
                  🏠 For Sale
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-6 lg:space-y-8">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-4 sm:p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">Filters</h3>
                  <button 
                    type="button" 
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                  >
                    Reset All
                  </button>
                </div>

                <form onSubmit={handleFilterSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Keywords</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        name="search" 
                        type="text" 
                        value={formState.search}
                        onChange={(e) => handleInputChange('search', e.target.value)}
                        placeholder="Search properties by name, location..." 
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Action</label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="relative cursor-pointer group">
                        <input 
                          type="radio" 
                          name="action" 
                          value="all" 
                          checked={formState.action === 'all'}
                          onChange={(e) => handleInputChange('action', e.target.value)}
                          className="peer sr-only" 
                        />
                        <div className="flex items-center justify-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm peer-checked:bg-primary peer-checked:text-white group-hover:bg-slate-100 transition-all">
                          All
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input 
                          type="radio" 
                          name="action" 
                          value="rent" 
                          checked={formState.action === 'rent'}
                          onChange={(e) => handleInputChange('action', e.target.value)}
                          className="peer sr-only" 
                        />
                        <div className="flex items-center justify-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm peer-checked:bg-primary peer-checked:text-white group-hover:bg-slate-100 transition-all">
                          Rent
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input 
                          type="radio" 
                          name="action" 
                          value="buy" 
                          checked={formState.action === 'buy'}
                          onChange={(e) => handleInputChange('action', e.target.value)}
                          className="peer sr-only" 
                        />
                        <div className="flex items-center justify-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm peer-checked:bg-primary peer-checked:text-white group-hover:bg-slate-100 transition-all">
                          Buy
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Categories' },
                        { value: 'luxe', label: 'Luxury' },
                        { value: 'ultra-luxe', label: 'Ultra Luxury' },
                        { value: 'branded', label: 'Branded Residences' },
                        { value: 'commercial', label: 'Commercial' },
                        { value: 'residential', label: 'Residential' }
                      ].map((cat) => (
                        <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="category" 
                            value={cat.value}
                            checked={formState.category === cat.value}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-4 h-4 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary/20 focus:ring-2 cursor-pointer" 
                          />
                          <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                            {cat.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Property Type</label>
                    <select 
                      name="type" 
                      value={formState.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartments</option>
                      <option value="villa">Villas</option>
                      <option value="townhouse">Townhouses</option>
                      <option value="penthouse">Penthouses</option>
                      <option value="studio">Studios</option>
                      <option value="plot">Plots</option>
                      <option value="office">Offices</option>
                      <option value="shop">Shops</option>
                      <option value="warehouse">Warehouses</option>
                      <option value="building">Commercial Buildings</option>
                      <option value="furnished-studio">Furnished Studios</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</label>
                    <select 
                      name="area" 
                      value={formState.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="">All Areas</option>
                      <option value="Dubai Marina">Dubai Marina</option>
                      <option value="Downtown Dubai">Downtown Dubai</option>
                      <option value="Palm Jumeirah">Palm Jumeirah</option>
                      <option value="Business Bay">Business Bay</option>
                      <option value="Jumeirah">Jumeirah</option>
                      <option value="Dubai Hills Estate">Dubai Hills Estate</option>
                      <option value="Dubai Creek Harbour">Dubai Creek Harbour</option>
                      <option value="Emirates Hills">Emirates Hills</option>
                      <option value="Arabian Ranches">Arabian Ranches</option>
                      <option value="Dubai South">Dubai South</option>
                      <option value="Al Barsha">Al Barsha</option>
                      <option value="Dubai Silicon Oasis">Dubai Silicon Oasis</option>
                      <option value="Deira">Deira</option>
                      <option value="Jumeirah Beach Residence">Jumeirah Beach Residence</option>
                      <option value="Dubai Islands">Dubai Islands</option>
                      <option value="Za'abeel">Za'abeel</option>
                      <option value="Al Kifaf">Al Kifaf</option>
                      <option value="Zabeel">Zabeel</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Range (AED)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="minPrice"
                        type="number"
                        placeholder="Min"
                        value={formState.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                      <input
                        name="maxPrice"
                        type="number"
                        placeholder="Max"
                        value={formState.maxPrice}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bedrooms</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['', '1', '2', '3', '4', '5'].map((val) => (
                        <label key={val} className="relative cursor-pointer group">
                          <input 
                            type="radio" 
                            name="beds" 
                            value={val}
                            checked={formState.beds === val}
                            onChange={(e) => handleInputChange('beds', e.target.value)}
                            className="peer sr-only" 
                          />
                          <div className="flex items-center justify-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm peer-checked:bg-primary peer-checked:text-white group-hover:bg-slate-100 transition-all">
                            {val === '' ? 'Any' : val === '5' ? '5+' : val}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bathrooms</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['', '1', '2', '3', '4', '5'].map((val) => (
                        <label key={val} className="relative cursor-pointer group">
                          <input 
                            type="radio" 
                            name="baths" 
                            value={val}
                            checked={formState.baths === val}
                            onChange={(e) => handleInputChange('baths', e.target.value)}
                            className="peer sr-only" 
                          />
                          <div className="flex items-center justify-center py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm peer-checked:bg-primary peer-checked:text-white group-hover:bg-slate-100 transition-all">
                            {val === '' ? 'Any' : val === '5' ? '5+' : val}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Furnished</label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'Any' },
                        { value: 'true', label: 'Furnished' },
                        { value: 'false', label: 'Unfurnished' }
                      ].map((furnish) => (
                        <label key={furnish.value} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="furnished" 
                            value={furnish.value}
                            checked={formState.furnished === furnish.value}
                            onChange={(e) => handleInputChange('furnished', e.target.value)}
                            className="w-4 h-4 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary/20 focus:ring-2 cursor-pointer" 
                          />
                          <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                            {furnish.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Completion Status</label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Properties' },
                        { value: 'ready', label: 'Ready to Move' },
                        { value: 'off-plan', label: 'Off-Plan' }
                      ].map((status) => (
                        <label key={status.value} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="completion" 
                            value={status.value}
                            checked={formState.completion === status.value}
                            onChange={(e) => handleInputChange('completion', e.target.value)}
                            className="w-4 h-4 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary/20 focus:ring-2 cursor-pointer" 
                          />
                          <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Property Features</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="hasVideo" 
                          checked={formState.hasVideo === 'true'}
                          onChange={(e) => handleInputChange('hasVideo', e.target.checked ? 'true' : '')}
                          className="w-5 h-5 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary/20 focus:ring-2 cursor-pointer" 
                        />
                        <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                          Properties with Video Tours
                        </span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20">
                    Apply Filters
                  </button>
                </form>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-4">Need Help?</h4>
                  <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                    Our expert agents are ready to help you find your perfect property.
                  </p>
                  <Link href={"/contact"} className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group/btn">
                    Contact Us
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 bg-white p-4 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 pl-4">
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  {total} Properties Found
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                {/* Sort dropdown can be added here */}
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <>
                <div className={`grid gap-8 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {paginatedProperties.map((property, i) => (
                    <div key={`${property.collection}-${property.id}`} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="relative group">
                        <PropertyCard
                          property={{
                            id: String(property.id),
                            title: property.title || 'Property',
                            price: property.price ?? 0,
                            priceLabel: property.status === 'rent' ? 'yearly' : 'total',
                            image: property.image || '',
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
                          }}
                        />
                        
                        {/* Gallery Icon Button */}
                        <button
                          onClick={() => handleGalleryOpenFromThumbnail(property)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-slate-200 flex items-center gap-2 text-slate-700 hover:text-primary font-bold text-xs z-10"
                        >
                          <Squares2X2Icon className="h-4 w-4" />
                          Gallery
                        </button>
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewDetails(property)}
                          className="absolute top-10 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-slate-200 flex items-center gap-2 text-slate-700 hover:text-primary font-bold text-xs"
                        >
                          <ArrowsPointingOutIcon className="h-4 w-4" />
                          Details
                        </button>
                      </div>

                      <div className="mt-2 flex gap-2">
                        {property.collection === 'agent_properties' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🤝 Agent Property
                            {property.agent_name && ` - ${property.agent_name}`}
                          </span>
                        )}
                        {property.status === 'rent' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🏠 For Rent
                          </span>
                        )}
                        {property.status === 'sale' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🏠 For Sale
                          </span>
                        )}
                        {property.category === 'luxe' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            👑 Luxury
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    {page > 1 && (
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold shadow-sm"
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
                                ? 'bg-primary text-white shadow-primary/20' 
                                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="text-slate-300">...</span>;
                      }
                      return null;
                    })}

                    {page < totalPages && (
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold shadow-sm"
                      >
                        →
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  {allProperties.length === 0 
                    ? 'No properties available.'
                    : 'We couldn\'t find any properties matching your current filters.'
                  }
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-8 bg-primary text-white py-3 px-8 rounded-full font-bold hover:bg-primary/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function LuxuryPropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  );
}