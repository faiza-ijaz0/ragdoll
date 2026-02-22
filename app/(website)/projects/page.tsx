"use client";

import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
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
  ArrowsPointingOutIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  Square3Stack3DIcon,
  PlayCircleIcon,
  GlobeAltIcon,
  Squares2X2Icon, // NEW: Added for gallery icon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore"; // addDoc import kiya

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
  latitude?: number;
  longitude?: number;
}

const developers = [
  { id: "all", name: "All Developers", count: 0 },
  { id: "emaar", name: "Emaar Properties", count: 0 },
  { id: "damac", name: "DAMAC Properties", count: 0 },
  { id: "nakheel", name: "Nakheel Properties", count: 0 },
];

// Helper function for formatting price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US").format(price);
};

// Helper function for formatting number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Video URL type check karna
const getVideoType = (url: string) => {
  if (!url) return "none";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  if (/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url))
    return "direct";
  return "external";
};

// YouTube video ID extract karna
const extractYouTubeId = (url: string) => {
  let videoId = "";
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1];
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("embed/")[1];
  }
  return videoId;
};

// Vimeo video ID extract karna
const extractVimeoId = (url: string) => {
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  return vimeoMatch ? vimeoMatch[1] : "";
};

// Get location coordinates for map based on project
const getLocationCoordinates = (project: Project | null | undefined) => {
  // Default coordinates for Dubai
  const defaultCoords = { lat: 25.2048, lng: 55.2708 };
  // Check if project has specific coordinates
  if (!project) {
    return defaultCoords;
  }
  if (project.latitude && project.longitude) {
    return { lat: project.latitude, lng: project.longitude };
  }

  // Try to get approximate coordinates based on area/city
  const locations: Record<string, { lat: number; lng: number }> = {
    downtown: { lat: 25.1972, lng: 55.2744 },
    "dubai marina": { lat: 25.0736, lng: 55.1383 },
    jumeirah: { lat: 25.2146, lng: 55.2431 },
    "business bay": { lat: 25.1867, lng: 55.2647 },
    "palm jumeirah": { lat: 25.1121, lng: 55.139 },
    "dubai hills": { lat: 25.0883, lng: 55.2793 },
    meydan: { lat: 25.1798, lng: 55.2597 },
    jvc: { lat: 25.0345, lng: 55.2004 },
    "dubai silicon oasis": { lat: 25.1148, lng: 55.3758 },
    "international city": { lat: 25.1751, lng: 55.3587 },
    "emirates hills": { lat: 25.0883, lng: 55.2793 },
    mirdif: { lat: 25.2181, lng: 55.4189 },
    "al barsha": { lat: 25.1134, lng: 55.2 },
  };

  const area = project.area?.toLowerCase() || project.city?.toLowerCase() || "";
  for (const [key, coords] of Object.entries(locations)) {
    if (area.includes(key)) {
      return coords;
    }
  }

  return defaultCoords;
};

// Gallery Icon Component - NEW
const GalleryIcon = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-slate-200 flex items-center gap-2 text-slate-700 hover:text-primary font-bold text-sm z-10"
  >
    <Squares2X2Icon className="h-4 w-4" />
    View Gallery
  </button>
);

// Request Information Form Component - NEW
const RequestInfoForm = ({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setError("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Firebase mein data save karna
      const requestInfoRef = collection(db, "request_information");

      await addDoc(requestInfoRef, {
        project_id: project.id,
        project_name: project.name,
        developer: project.developer || "",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message || "",
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSubmitSuccess(true);

      // Success message ke baad modal close karna
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsSubmitting(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving request information:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm mt-20">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
        <div className="relative h-15">
          <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center">
            <h3 className="text-3xl font-serif text-white text-center px-4">
              Request Information: {project.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-all"
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
              <h3 className="text-2xl font-bold text-secondary mb-2">
                Request Submitted!
              </h3>
              <p className="text-slate-600 mb-2">
                Thank you for your interest in{" "}
                <span className="font-bold">{project.name}</span>.
              </p>
              <p className="text-slate-500 text-sm">
                Our team will contact you within 24 hours with detailed
                information.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 text-slate-700"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+971 50 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    placeholder="Please provide any specific information you're looking for..."
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 resize-none text-slate-700"
                  ></textarea>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Full Screen Gallery Component - NEW
const FullScreenGallery = ({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Get all media (images + video) for the project
  const getProjectMedia = () => {
    const media = [];

    // Add hero image
    if (project.hero_image_url) {
      media.push({
        type: "image",
        url: project.hero_image_url,
        thumbnail: project.hero_image_url,
      });
    }

    // Add other images
    if (project.images && project.images.length > 0) {
      project.images.forEach((img) => {
        media.push({
          type: "image",
          url: img,
          thumbnail: img,
        });
      });
    }

    // Add video as last item if exists
    if (project.video_url) {
      const videoType = getVideoType(project.video_url);
      if (videoType !== "none") {
        media.push({
          type: "video",
          url: project.video_url,
          thumbnail: project.video_url,
        });
      }
    }

    return media;
  };

  const projectMedia = getProjectMedia();

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? projectMedia.length - 1 : prev - 1,
    );
    setIsVideoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === projectMedia.length - 1 ? 0 : prev + 1,
    );
    setIsVideoPlaying(false);
  };

  const renderMedia = () => {
    const media = projectMedia[currentIndex];
    if (!media) return null;

    if (media.type === "video") {
      const videoType = getVideoType(media.url);

      if (videoType === "youtube") {
        const videoId = extractYouTubeId(media.url);
        return isVideoPlaying ? (
          <div className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={`${project.name} - YouTube Video`}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={project.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
        );
      } else if (videoType === "direct") {
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
              <source
                src={media.url}
                type={`video/${media.url.split(".").pop()?.split("?")[0]}`}
              />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        );
      } else {
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
              <source src={media.url} type="video/avi" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        );
      }
    }

    // Image display
    return (
      <img
        src={media.url}
        alt={`${project.name} - Image ${currentIndex + 1}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = "/default-image.jpg";
        }}
      />
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent">
        <div className="text-white">
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-sm text-gray-300">
            {currentIndex + 1} / {projectMedia.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Media */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full max-w-7xl">{renderMedia()}</div>
      </div>

      {/* Navigation Arrows */}
      {projectMedia.length > 1 && (
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

      {/* Thumbnails */}
      {projectMedia.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
          <div className="flex gap-2 overflow-x-auto justify-center">
            {projectMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsVideoPlaying(false);
                }}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-white scale-110"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                {media.type === "video" ? (
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
                      e.currentTarget.src = "/default-image.jpg";
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState("all");
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [requestInfoModal, setRequestInfoModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null }); // NEW: Request Info Modal
  const [selectedImageIndex, setSelectedImageIndex] = useState<{
    [key: string]: number;
  }>({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Firebase se data fetch karna
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("published", "==", true));
      const querySnapshot = await getDocs(q);

      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          name: data.name || "",
          developer: data.developer || "",
          developer_id: data.developer_id || null,
          status: data.status || "in-progress",
          launch_date: data.launch_date || "",
          completion_date: data.completion_date || "",
          city: data.city || "",
          area: data.area || "",
          address: data.address || "",
          district: data.district || "",
          starting_price: data.starting_price || 0,
          currency: data.currency || "AED",
          total_units: data.total_units || 0,
          available_units: data.available_units || 0,
          property_types: data.property_types || [],
          hero_image_url: data.hero_image_url || "/default-image.jpg",
          images: data.images || [],
          description: data.description || "",
          payment_plan: data.payment_plan || null,
          payment_terms: data.payment_terms || null,
          amenities: data.amenities || [],
          facilities: data.facilities || [],
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
          sold_units: data.sold_units || 0,
          brochure_url: data.brochure_url || "",
          video_url: data.video_url || "",
          featured: data.featured || false,
          published: data.published || false,
          handover_date: data.handover_date || "",
          enquiries_count: data.enquiries_count || 0,
          views_count: data.views_count || 0,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          seo_keywords: data.seo_keywords || [],
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        });
      });

      setProjects(projectsData);

      // Developer counts update karen
      updateDeveloperCounts(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeveloperCounts = (projectsData: Project[]) => {
    const emaarCount = projectsData.filter(
      (p) =>
        p.developer === "Emaar Properties" ||
        p.developer?.toLowerCase().includes("emaar"),
    ).length;
    const damacCount = projectsData.filter(
      (p) =>
        p.developer === "DAMAC Properties" ||
        p.developer?.toLowerCase().includes("damac"),
    ).length;
    const nakheelCount = projectsData.filter(
      (p) =>
        p.developer === "Nakheel Properties" ||
        p.developer?.toLowerCase().includes("nakheel"),
    ).length;

    developers[0].count = projectsData.length;
    developers[1].count = emaarCount;
    developers[2].count = damacCount;
    developers[3].count = nakheelCount;
  };

  const handleViewDetails = async (projectId: string) => {
    try {
      // Fetch complete project details from Firebase
      const projectDoc = doc(db, "projects", projectId);
      const projectSnapshot = await getDoc(projectDoc);

      if (projectSnapshot.exists()) {
        const data = projectSnapshot.data();
        const projectDetails: Project = {
          id: projectSnapshot.id,
          name: data.name || "",
          developer: data.developer || "",
          developer_id: data.developer_id || null,
          status: data.status || "in-progress",
          launch_date: data.launch_date || "",
          completion_date: data.completion_date || "",
          city: data.city || "",
          area: data.area || "",
          address: data.address || "",
          district: data.district || "",
          starting_price: data.starting_price || 0,
          currency: data.currency || "AED",
          total_units: data.total_units || 0,
          available_units: data.available_units || 0,
          property_types: data.property_types || [],
          hero_image_url: data.hero_image_url || "/default-image.jpg",
          images: data.images || [],
          description: data.description || "",
          payment_plan: data.payment_plan || null,
          payment_terms: data.payment_terms || null,
          amenities: data.amenities || [],
          facilities: data.facilities || [],
          min_price: data.min_price || 0,
          max_price: data.max_price || 0,
          sold_units: data.sold_units || 0,
          brochure_url: data.brochure_url || "",
          video_url: data.video_url || "",
          featured: data.featured || false,
          published: data.published || false,
          handover_date: data.handover_date || "",
          enquiries_count: data.enquiries_count || 0,
          views_count: data.views_count || 0,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          seo_keywords: data.seo_keywords || [],
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        };

        setDetailsModal({ isOpen: true, project: projectDetails });
        setCurrentMediaIndex(0);
        setIsVideoPlaying(false);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  // NEW: Request Information button handler
  const handleRequestInfo = (project: Project) => {
    setRequestInfoModal({ isOpen: true, project: project });
  };

  const filteredProjects =
    selectedDeveloper === "all"
      ? projects
      : projects.filter((project) => {
          if (selectedDeveloper === "emaar") {
            return project.developer?.toLowerCase().includes("emaar");
          } else if (selectedDeveloper === "damac") {
            return project.developer?.toLowerCase().includes("damac");
          } else if (selectedDeveloper === "nakheel") {
            return project.developer?.toLowerCase().includes("nakheel");
          }
          return false;
        });

  const handleImageChange = (projectId: string, direction: "next" | "prev") => {
    const currentIndex = selectedImageIndex[projectId] || 0;
    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.images || project.images.length === 0) return;

    const maxIndex = project.images.length - 1;
    let newIndex;

    if (direction === "next") {
      newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    }

    setSelectedImageIndex((prev) => ({
      ...prev,
      [projectId]: newIndex,
    }));
  };

  // Get all media (images + video) for a project
  const getProjectMedia = (project: Project) => {
    const media = [];

    // Add hero image
    if (project.hero_image_url) {
      media.push({
        type: "image",
        url: project.hero_image_url,
        thumbnail: project.hero_image_url,
      });
    }

    // Add other images
    if (project.images && project.images.length > 0) {
      project.images.forEach((img) => {
        media.push({
          type: "image",
          url: img,
          thumbnail: img,
        });
      });
    }

    // Add video as last item if exists
    if (project.video_url && getVideoType(project.video_url) !== "none") {
      media.push({
        type: "video",
        url: project.video_url,
        thumbnail: project.video_url,
      });
    }

    return media;
  };

  const handlePrevMedia = () => {
    if (!detailsModal.project) return;
    const projectMedia = getProjectMedia(detailsModal.project);
    setCurrentMediaIndex((prev) =>
      prev === 0 ? projectMedia.length - 1 : prev - 1,
    );
    setIsVideoPlaying(false);
  };

  const handleNextMedia = () => {
    if (!detailsModal.project) return;
    const projectMedia = getProjectMedia(detailsModal.project);
    setCurrentMediaIndex((prev) =>
      prev === projectMedia.length - 1 ? 0 : prev + 1,
    );
    setIsVideoPlaying(false);
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const renderCurrentMedia = (project: Project) => {
    const projectMedia = getProjectMedia(project);
    const currentMedia = projectMedia[currentMediaIndex];

    if (!currentMedia) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <div className="text-slate-400">No media available</div>
        </div>
      );
    }

    if (currentMedia.type === "video") {
      const videoType = getVideoType(currentMedia.url);

      if (videoType === "youtube") {
        const videoId = extractYouTubeId(currentMedia.url);
        return (
          <div className="relative w-full h-full">
            {isVideoPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={`${project.name} - YouTube Video`}
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={handlePlayVideo}
                    className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <PlayCircleIcon className="w-12 h-12 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                  VIDEO
                </div>
              </div>
            )}
          </div>
        );
      } else if (videoType === "direct") {
        return (
          <div className="relative w-full h-full">
            <video
              key={currentMedia.url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain bg-black"
              preload="auto"
              playsInline
              controlsList="nodownload"
            >
              <source
                src={currentMedia.url}
                type={`video/${currentMedia.url.split(".").pop()?.split("?")[0]}`}
              />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        );
      } else {
        // External video - ab automatically play hoga aur loop mein chalega
        // Pehle video play karne ki koshish karen
        return (
          <div className="relative w-full h-full">
            <video
              key={currentMedia.url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain bg-black"
              preload="auto"
              playsInline
              controlsList="nodownload"
            >
              <source src={currentMedia.url} type="video/mp4" />
              <source src={currentMedia.url} type="video/webm" />
              <source src={currentMedia.url} type="video/ogg" />
              <source src={currentMedia.url} type="video/mov" />
              <source src={currentMedia.url} type="video/avi" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
              VIDEO
            </div>
          </div>
        );
      }
    }

    // Image display
    return (
      <img
        src={currentMedia.url}
        alt={project.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/default-image.jpg";
        }}
      />
    );
  };

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
            Discover Dubai's most ambitious architectural marvels and high-yield
            investment opportunities in off-plan properties.
          </p>
          <p className="text-xl text-white max-w-2xl mx-auto">
            {selectedDeveloper === "all"
              ? "Explore our curated selection of premium off-plan properties from Dubai's leading developers"
              : `Discover exceptional properties from ${developers.find((d) => d.id === selectedDeveloper)?.name}`}
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-5">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl text-slate-400 mb-2">
                No projects found
              </h3>
              <p className="text-slate-500">
                Try selecting a different developer filter
              </p>
            </div>
          ) : (
            <div className="grid gap-12">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white h-[300px] border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 group flex flex-col lg:flex-row hover:shadow-primary/10 transition-shadow duration-500"
                >
                  {/* Image Section */}
                  <div className="lg:w-2/5 relative h-[400px] lg:h-auto overflow-hidden">
                    <Image
                      src={project.hero_image_url || "/default-image.jpg"}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/default-image.jpg";
                      }}
                    />

                    <div className="absolute top-6 left-6">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${
                          project.status === "completed"
                            ? "bg-emerald-500 text-white"
                            : "bg-primary text-secondary"
                        }`}
                      >
                        {project.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </span>
                    </div>

                    {/* NEW: Gallery Icon */}
                    <GalleryIcon
                      onClick={() =>
                        setGalleryModal({ isOpen: true, project: project })
                      }
                    />

                    {/* VIEW DETAILS BUTTON - LUXE STYLE */}
                    <button
                      onClick={() => handleViewDetails(project.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg hover:shadow-xl hover:bg-white border border-slate-200 flex items-center gap-2 text-slate-700 hover:text-primary font-bold text-sm z-10"
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                      View Details
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-3/5 p-10 mt-2 md:p-16 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-primary">
                      <SparklesIcon className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">
                        {project.developer || "Developer"}
                      </span>
                    </div>

                    <h3 className="text-4xl font-serif text-secondary mb-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>

                    <p className="text-slate-500 mb-2 leading-relaxed text-lg">
                      {project.description.slice(0, 30)}....
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-2">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">
                          Location
                        </div>
                        <div className="text-secondary font-bold flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 text-primary" />
                          {project.area || project.city}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">
                          Completion
                        </div>
                        <div className="text-secondary font-bold flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {project.completion_date
                            ? new Date(project.completion_date).getFullYear()
                            : "TBA"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">
                          Available Units
                        </div>
                        <div className="text-secondary font-bold text-sm">
                          {project.available_units} / {project.total_units}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">
                          Price Range
                        </div>
                        <div className="text-secondary font-bold text-sm">
                          {project.currency}{" "}
                          {project.min_price
                            ? `${formatNumber(project.min_price)}`
                            : "N/A"}{" "}
                          -{" "}
                          {project.max_price
                            ? `${formatNumber(project.max_price)}`
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Amenities/Facilities show karen */}
                    <div className="mb-2">
                      <div className="text-xs text-slate-400 uppercase tracking-widest mb-3">
                        Amenities & Features
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.amenities && project.amenities.length > 0 ? (
                          project.amenities
                            .slice(0, 4)
                            .map((amenity, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                {amenity}
                              </span>
                            ))
                        ) : project.facilities &&
                          project.facilities.length > 0 ? (
                          project.facilities
                            .slice(0, 4)
                            .map((facility, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                {facility}
                              </span>
                            ))
                        ) : project.property_types &&
                          project.property_types.length > 0 ? (
                          project.property_types
                            .slice(0, 4)
                            .map((type, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
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
              Dubai's off-plan property market offers unparalleled opportunities
              for investors seeking capital growth and rental income
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8-15%</div>
              <div className="text-lg font-semibold mb-4">
                Annual Appreciation
              </div>
              <p className="text-slate-300">
                Consistent property value growth driven by Dubai's expanding
                economy and infrastructure development
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                4-6 Years
              </div>
              <div className="text-lg font-semibold mb-4">Payment Plans</div>
              <p className="text-slate-300">
                Extended payment schedules allowing investors to spread costs
                while construction progresses
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <div className="text-lg font-semibold mb-4">
                Interest Payments
              </div>
              <p className="text-slate-300">
                No interest charges on construction payments, preserving capital
                for other investments
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5-8%</div>
              <div className="text-lg font-semibold mb-4">Rental Yield</div>
              <p className="text-slate-300">
                Competitive rental returns from Dubai's growing expatriate and
                tourist population
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Full Screen Gallery Modal */}
      {galleryModal.isOpen && galleryModal.project && (
        <FullScreenGallery
          project={galleryModal.project}
          onClose={() => setGalleryModal({ isOpen: false, project: null })}
        />
      )}

      {/* NEW: Request Information Modal */}
      {requestInfoModal.isOpen && requestInfoModal.project && (
        <RequestInfoForm
          project={requestInfoModal.project}
          onClose={() => setRequestInfoModal({ isOpen: false, project: null })}
        />
      )}

      {/* Project Details Modal - LUXE STYLE with VIDEO in Gallery */}
      {detailsModal.isOpen && detailsModal.project && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Top Header Bar - WITH TITLE AND ARROW */}
          <div className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
            <div className="container-custom py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Arrow Button - Click se modal close */}
                </div>

                <div className="flex items-center gap-4">
                  <button className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    <HeartIcon className="h-4 w-4 mr-2 inline" />
                    Save Project
                  </button>
                  <button className="px-5 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    <ShareIcon className="h-4 w-4 mr-2 inline" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Full Screen */}

          <div className="container-custom pt-8 pb-12 mt-25">
            <div className="flex -mt-10 mb-5">
              <button
                onClick={() =>
                  setDetailsModal({ isOpen: false, project: null })
                }
                className="h-10 w-10 rounded-full bg-gray-100 -mt- flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              {/* Project Title */}
              <span className="text-4xl ml-5 font-bold text-slate-700">
                {detailsModal.project.name} Project
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column - Main Content */}

              <div className="lg:col-span-8 space-y-12">
                {/* Media Gallery (Images + Video) */}

                <div className="overflow-hidden shadow-2xl rounded-3xl shadow-slate-200/50">
                  <div className="relative h-[500px] bg-slate-100 overflow-hidden">
                    {renderCurrentMedia(detailsModal.project)}

                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      {/* Left side - Status badges */}
                      <div className="flex gap-2">
                        <span className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg">
                          OFF-PLAN
                        </span>
                        {detailsModal.project.featured && (
                          <span className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full shadow-lg">
                            FEATURED
                          </span>
                        )}
                        <span className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full shadow-lg">
                          {detailsModal.project.status?.toUpperCase() ||
                            "IN-PROGRESS"}
                        </span>

                        <button
                          onClick={() =>
                            setGalleryModal({
                              isOpen: true,
                              project: detailsModal.project,
                            })
                          }
                          className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:text-primary font-bold text-sm flex items-center gap-1 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 z-20"
                          title="Open Full Screen Gallery"
                        >
                          <Squares2X2Icon className="w-4 h-4" />
                          <span>Gallery</span>
                        </button>
                      </div>

                      {/* Right side - Media counter */}
                      {(() => {
                        const projectMedia = getProjectMedia(
                          detailsModal.project,
                        );
                        if (projectMedia.length > 0) {
                          const currentMedia = projectMedia[currentMediaIndex];
                          return (
                            <div className="absolute top-2 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full flex items-center gap-1 z-20">
                              {currentMedia.type === "video" ? (
                                <VideoCameraIcon className="w-4 h-4" />
                              ) : (
                                <PhotoIcon className="w-4 h-4" />
                              )}
                              {currentMediaIndex + 1} / {projectMedia.length}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Media Navigation - Always show for multiple media */}
                    {(() => {
                      const projectMedia = getProjectMedia(
                        detailsModal.project,
                      );
                      if (projectMedia.length > 1) {
                        return (
                          <>
                            <button
                              onClick={handlePrevMedia}
                              className="absolute left-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-slate-700 hover:text-primary transition-colors shadow-xl"
                            >
                              <ChevronLeftIcon className="w-5 h-5 text-white" />
                            </button>

                            <button
                              onClick={handleNextMedia}
                              className="absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-slate-700 hover:text-primary transition-colors shadow-xl"
                            >
                              <ChevronRightIcon className="w-5 h-5 text-white" />
                            </button>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Thumbnail Gallery */}
                  {(() => {
                    const projectMedia = getProjectMedia(detailsModal.project);
                    if (projectMedia.length > 1) {
                      return (
                        <div className="p-1 py-4">
                          <div className="flex gap-4 overflow-x-auto pb-4">
                            {projectMedia.map((media, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setCurrentMediaIndex(idx);
                                  if (media.type === "video") {
                                    setIsVideoPlaying(false);
                                  }
                                }}
                                className={`shrink-0 w-25 rounded-xl h-20 overflow-hidden border-4 transition-all ${
                                  idx === currentMediaIndex
                                    ? "border-primary"
                                    : "border-transparent hover:border-slate-300"
                                }`}
                              >
                                {media.type === "video" ? (
                                  <div className="relative w-full h-full">
                                    <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                      <VideoCameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                                      VIDEO
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={
                                      media.thumbnail || "/default-image.jpg"
                                    }
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Project Details Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="space-y-10">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            {detailsModal.project.property_types?.[0]?.toUpperCase() ||
                              "DEVELOPMENT"}
                          </span>
                          <span className="px-4 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            {detailsModal.project.status?.toUpperCase() ||
                              "IN-PROGRESS"}
                          </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                          {detailsModal.project.name}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <MapPinIcon className="w-5 h-5 text-primary" />
                          <span>
                            {detailsModal.project.address ||
                              detailsModal.project.area ||
                              `${detailsModal.project.city || "Dubai"}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                          STARTING PRICE
                        </div>
                        <div className="text-4xl md:text-5xl font-black text-primary">
                          {detailsModal.project.currency}{" "}
                          {formatPrice(
                            detailsModal.project.starting_price * 1000,
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="flex gap-20 justify-around p-8 bg-slate-50 rounded-4xl border border-slate-100">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          TOTAL UNITS
                        </div>
                        <div className="flex items-center gap-2">
                          <HomeIcon className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-black text-slate-900">
                            {detailsModal.project.total_units || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          AVAILABLE UNITS
                        </div>
                        <div className="flex items-center gap-2">
                          <HomeModernIcon className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-black text-slate-900">
                            {detailsModal.project.available_units || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          SOLD UNITS
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-black text-slate-900">
                            {detailsModal.project.sold_units || 0}
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
                        Project Description
                      </h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium bg-slate-50 p-8 rounded-3xl border border-slate-100">
                          {detailsModal.project.description}
                        </p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {detailsModal.project.amenities &&
                      detailsModal.project.amenities.length > 0 && (
                        <div className="space-y-6 pt-10 border-t border-slate-100">
                          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                              <SparklesIcon className="w-5 h-5" />
                            </span>
                            Amenities & Facilities
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detailsModal.project.amenities.map(
                              (amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300"
                                >
                                  <CheckCircleIcon className="w-5 h-5 text-primary shrink-0" />
                                  <span className="text-slate-700 font-bold text-sm">
                                    {amenity}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Property Types */}
                    {detailsModal.project.property_types &&
                      detailsModal.project.property_types.length > 0 && (
                        <div className="space-y-6 pt-10 border-t border-slate-100">
                          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                              <HomeModernIcon className="w-5 h-5" />
                            </span>
                            Property Types Available
                          </h2>
                          <div className="flex flex-wrap gap-3">
                            {detailsModal.project.property_types.map(
                              (type, index) => (
                                <span
                                  key={index}
                                  className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-2xl text-sm"
                                >
                                  {type}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Google Map Location */}
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <GlobeAltIcon className="w-5 h-5" />
                        </span>
                        Project Location
                      </h2>

                      <div className="bg-gray-100 rounded-[2.5rem] h-[500px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative">
                        {/* Map iframe */}
                        <div className="w-full h-full">
                          {(() => {
                            const coords = getLocationCoordinates(
                              detailsModal.project,
                            );
                            const address = encodeURIComponent(
                              detailsModal.project.address ||
                                detailsModal.project.area ||
                                detailsModal.project.city ||
                                "Dubai, United Arab Emirates",
                            );
                            const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462562.65095637795!2d54.94728926249997!3d25.07575955953261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1690465000000!5m2!1sen!2s`;

                            // If we have specific coordinates, use them
                            const preciseMapUrl =
                              detailsModal.project.latitude &&
                              detailsModal.project.longitude
                                ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.178258875107!2d${detailsModal.project.longitude}!3d${detailsModal.project.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!4v${Date.now()}`
                                : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462562.65095637795!2d54.94728926249997!3d25.07575955953261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1690465000000!5m2!1sen!2s`;

                            return (
                              <iframe
                                src={preciseMapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Property Location Map"
                                className="rounded-[2.5rem]"
                              />
                            );
                          })()}

                          {/* Map Pin Overlay */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="flex flex-col items-center">
                              {/* Pin Icon */}
                              <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl animate-pulse">
                                  <MapPinIcon className="h-8 w-8 text-white" />
                                </div>
                                {/* Pin Tail */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-red-500 rotate-45"></div>
                              </div>

                              {/* Location Info Card */}
                              <div className="mt-4 bg-white rounded-2xl p-4 shadow-2xl max-w-xs">
                                <div className="font-bold text-slate-900 text-lg mb-1">
                                  {detailsModal.project.name}
                                </div>
                                <div className="text-slate-600 text-sm">
                                  {detailsModal.project.address ||
                                    detailsModal.project.area ||
                                    detailsModal.project.city ||
                                    "Dubai, United Arab Emirates"}
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                  {(() => {
                                    const coords = getLocationCoordinates(
                                      detailsModal.project,
                                    );
                                    return `Coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Map Controls */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            detailsModal.project.address ||
                              detailsModal.project.area ||
                              detailsModal.project.city ||
                              "Dubai",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                          <MapPinIcon className="w-5 h-5" />
                          Get Directions
                        </a>
                        <button
                          onClick={() => {
                            const coords = getLocationCoordinates(
                              detailsModal.project,
                            );
                            const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                            window.open(mapsUrl, "_blank");
                          }}
                          className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                          <GlobeAltIcon className="w-5 h-5" />
                          Open in Google Maps
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="sticky top-32 space-y-8">
                  {/* Developer Card */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                    <div>
                      <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                        <div className="text-center">
                          <div className="text-lg font-black text-slate-900">
                            {detailsModal.project.total_units || 0}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            TOTAL UNITS
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-slate-900">
                            {detailsModal.project.available_units || 0}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            AVAILABLE
                          </div>
                        </div>
                      </div>
                      {/* Contact Buttons - UPDATED */}
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            handleRequestInfo(detailsModal.project!)
                          }
                          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                          <EnvelopeIcon className="w-5 h-5" />
                          Request Information
                        </button>
                        <button
                          onClick={() => {
                            const phone = "+971 4 123 4567";
                            window.open(`https://wa.me/${phone}`, "_blank");
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          WhatsApp Inquiry
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="relative z-10 space-y-6">
                      <h3 className="text-2xl font-black tracking-tight">
                        Project Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/20">
                          <span className="text-slate-300">Launch Date</span>
                          <span className="font-bold">
                            {detailsModal.project.launch_date
                              ? new Date(
                                  detailsModal.project.launch_date,
                                ).toLocaleDateString()
                              : "TBA"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/20">
                          <span className="text-slate-300">Completion</span>
                          <span className="font-bold">
                            {detailsModal.project.completion_date
                              ? new Date(
                                  detailsModal.project.completion_date,
                                ).toLocaleDateString()
                              : "TBA"}
                          </span>
                        </div>
                        {detailsModal.project.handover_date && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Handover</span>
                            <span className="font-bold">
                              {new Date(
                                detailsModal.project.handover_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Range Card */}
                  <div className="border border-slate-200 rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-4">
                      Price Range
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Starting Price</span>
                        <span className="text-lg font-bold text-primary">
                          {detailsModal.project.currency}{" "}
                          {formatPrice(
                            detailsModal.project.starting_price * 1000,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Min Price</span>
                        <span className="text-lg font-bold text-slate-900">
                          {detailsModal.project.currency}{" "}
                          {formatNumber(detailsModal.project.min_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Max Price</span>
                        <span className="text-lg font-bold text-slate-900">
                          {detailsModal.project.currency}{" "}
                          {formatNumber(detailsModal.project.max_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProjectsPageContent />
    </Suspense>
  );
}
