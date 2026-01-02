'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types'
import PropertyCard, { PropertyCardProperty } from '@/components/property/PropertyCard'
import PropertyAgents from '@/components/property/PropertyAgents'
import {
  ViewColumnsIcon,
  QueueListIcon,
  MagnifyingGlassIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation';

// Firebase imports
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

type Property = Database['public']['Tables']['properties']['Row']
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
}

// Function to fetch RENT properties from 'properties' collection
async function fetchRentPropertiesFromMainCollection() {
  try {
    console.log('🔥 Fetching RENT properties from main collection...');
    const propertiesRef = collection(db, 'properties');
    
    const q = query(
      propertiesRef,
      where('status', '==', 'rent')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Main Collection: Found ${querySnapshot.size} RENT properties`);
    
    const properties: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Main Property ${doc.id}:`, {
        title: data.title,
        status: data.status,
        published: data.published,
        price: data.price,
        city: data.city
      });
      
      properties.push({
        id: doc.id,
        collection: 'properties',
        ...data
      });
    });
    
    return properties;
    
  } catch (error: any) {
    console.error('❌ Error fetching RENT from main collection:', error.message);
    return [];
  }
}

// Function to fetch RENT properties from 'agent_properties' collection
async function fetchRentPropertiesFromAgentCollection() {
  try {
    console.log('🔥 Fetching RENT properties from agent_properties collection...');
    const agentPropertiesRef = collection(db, 'agent_properties');
    
    // Only filter by status='rent' and review_status='published'
    const q = query(
      agentPropertiesRef,
      where('status', '==', 'rent'),
      where('review_status', '==', 'published')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Agent Collection: Found ${querySnapshot.size} RENT properties`);
    
    const properties: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Agent Property ${doc.id}:`, {
        title: data.title,
        status: data.status,
        review_status: data.review_status,
        price: data.price,
        city: data.city,
        published: data.published
      });
      
      properties.push({
        id: doc.id,
        collection: 'agent_properties',
        ...data
      });
    });
    
    return properties;
    
  } catch (error: any) {
    console.error('❌ Error fetching RENT from agent collection:', error.message);
    return [];
  }
}

// Main function to fetch all RENT properties from both collections
async function fetchAllRentProperties() {
  try {
    console.log('🔄 Fetching RENT properties from ALL collections...');
    
    // Fetch from both collections simultaneously
    const [mainProperties, agentProperties] = await Promise.all([
      fetchRentPropertiesFromMainCollection(),
      fetchRentPropertiesFromAgentCollection()
    ]);
    
    console.log(`📊 Results: ${mainProperties.length} from main, ${agentProperties.length} from agent`);
    
    // Combine both collections
    const allProperties = [...mainProperties, ...agentProperties];
    console.log(`✅ Total RENT properties found: ${allProperties.length}`);
    
    // Debug: Show all properties data
    console.log('📋 ALL PROPERTIES DATA:');
    allProperties.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title || 'No Title'} - ${p.price} AED - ${p.status} - Collection: ${p.collection}`);
      console.log(`     Published: ${p.published}, Review Status: ${p.review_status}`);
    });
    
    return allProperties;
    
  } catch (error) {
    console.error('❌ Error in fetchAllRentProperties:', error);
    return [];
  }
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for properties and filters
  const [allProperties, setAllProperties] = useState<NormalizedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<NormalizedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get filter values from URL
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const action = searchParams.get('action') || 'rent';
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

  // Local form state
  const [formState, setFormState] = useState({
    action,
    category,
    type,
    area,
    minPrice,
    maxPrice,
    beds,
    baths,
    furnished,
    completion,
    hasVideo,
    search
  });

  // Fetch RENT properties on component mount
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      console.log('🔄 Loading properties...');
      const properties = await fetchAllRentProperties();
      
      // Normalize properties
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
        
        // Determine price
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
        
        // Determine location
        const location = p.location || p.address || p.area || p.city || 'Dubai';
        
        // Handle property_status vs completion
        const completionStatus = p.completion || p.property_status || 'ready';
        
        // Handle different field names for area
        const propertyArea = p.area || p.location || p.address || p.neighborhood || p.district || 'Dubai';
        
        // For rent properties, priceLabel should be 'yearly'
        const priceLabel = 'yearly';
        
        // Handle features array
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
          priceLabel: priceLabel,
          area: propertyArea,
          city: p.city || 'Dubai',
          location: location,
          beds: p.beds ?? 0,
          baths: p.baths ?? 0,
          sqft: p.sqft ?? 0,
          type: p.type || p.subtype || 'Apartment',
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
          status: p.status || 'rent',
          agent_name: p.agent_name || null,
          review_status: p.review_status || null,
          submitted_at: p.submitted_at || null,
          collection: p.collection || 'properties'
        };
      });
      
      console.log(`✅ Normalized ${normalized.length} properties`);
      setAllProperties(normalized);
      setLoading(false);
    }
    
    loadProperties();
  }, []);

  // Apply filters whenever filter parameters change
  useEffect(() => {
    if (allProperties.length === 0) {
      console.log('⚠️ No properties to filter');
      setFilteredProperties([]);
      return;
    }
    
    console.log(`🔄 Applying filters to ${allProperties.length} properties...`);
    console.log('🔍 Current filters:', {
      action, category, type, area, minPrice, maxPrice,
      beds, baths, furnished, completion, search
    });

    let filtered = [...allProperties];
    
    // Filter by action (rent/buy)
    if (action === 'rent') {
      filtered = filtered.filter(p => p.status === 'rent');
      console.log(`✅ After rent filter: ${filtered.length}`);
    } else if (action === 'buy') {
      filtered = filtered.filter(p => p.status === 'sale');
      console.log(`✅ After buy filter: ${filtered.length}`);
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(p => p.category === category);
      console.log(`✅ After category filter: ${filtered.length}`);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter(p => p.type?.toLowerCase() === type.toLowerCase());
      console.log(`✅ After type filter: ${filtered.length}`);
    }

    // Filter by area
    if (area) {
      filtered = filtered.filter(p => 
        p.area?.toLowerCase().includes(area.toLowerCase()) || 
        p.city?.toLowerCase().includes(area.toLowerCase()) ||
        p.location?.toLowerCase().includes(area.toLowerCase())
      );
      console.log(`✅ After area filter: ${filtered.length}`);
    }

    // Filter by developer
    if (developer) {
      filtered = filtered.filter(p => p.developer?.toLowerCase().includes(developer.toLowerCase()));
      console.log(`✅ After developer filter: ${filtered.length}`);
    }

    // Filter by price
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(minPrice));
      console.log(`✅ After minPrice filter: ${filtered.length}`);
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
      console.log(`✅ After maxPrice filter: ${filtered.length}`);
    }

    // Filter by beds
    if (beds) {
      filtered = filtered.filter(p => p.beds === parseInt(beds));
      console.log(`✅ After beds filter: ${filtered.length}`);
    }

    // Filter by baths
    if (baths) {
      filtered = filtered.filter(p => p.baths === parseInt(baths));
      console.log(`✅ After baths filter: ${filtered.length}`);
    }

    // Filter by sqft
    if (minSqft) {
      filtered = filtered.filter(p => p.sqft >= parseInt(minSqft));
      console.log(`✅ After minSqft filter: ${filtered.length}`);
    }
    if (maxSqft) {
      filtered = filtered.filter(p => p.sqft <= parseInt(maxSqft));
      console.log(`✅ After maxSqft filter: ${filtered.length}`);
    }

    // Filter by furnished
    if (furnished === 'true') {
      filtered = filtered.filter(p => p.furnished === true);
      console.log(`✅ After furnished=true filter: ${filtered.length}`);
    } else if (furnished === 'false') {
      filtered = filtered.filter(p => p.furnished === false || p.furnished === null);
      console.log(`✅ After furnished=false filter: ${filtered.length}`);
    }

    // Filter by parking
    if (parking) {
      filtered = filtered.filter(p => p.parking?.toLowerCase() === parking.toLowerCase());
      console.log(`✅ After parking filter: ${filtered.length}`);
    }

    // Filter by property age
    if (propertyAge) {
      filtered = filtered.filter(p => p.propertyAge === propertyAge);
      console.log(`✅ After propertyAge filter: ${filtered.length}`);
    }

    // Filter by completion
    if (completion) {
      filtered = filtered.filter(p => p.completion === completion);
      console.log(`✅ After completion filter: ${filtered.length}`);
    }

    // Filter by video availability
    if (hasVideo === 'true') {
      filtered = filtered.filter(p => p.video_url && p.video_url.trim() !== '');
      console.log(`✅ After hasVideo filter: ${filtered.length}`);
    }

    // Features filter
    const featuresList = features ? features.split(',').map(f => f.trim()).filter(Boolean) : [];
    if (featuresList.length > 0) {
      filtered = filtered.filter((p: NormalizedProperty) => {
        if (!p.features || !Array.isArray(p.features)) return false;
        return featuresList.every(f => (p.features || []).includes(f));
      });
      console.log(`✅ After features filter: ${filtered.length}`);
    }

    // Search filtering
    if (search && search.trim() !== '') {
      const sLower = search.toLowerCase();
      filtered = filtered.filter(p => {
        const inTitle = p.title?.toLowerCase().includes(sLower);
        const inLocation = p.location?.toLowerCase().includes(sLower);
        const inArea = (p.area || '').toLowerCase().includes(sLower);
        const inDesc = (p.description || '').toLowerCase().includes(sLower);
        const inDeveloper = ((p.developer || '') as string).toLowerCase().includes(sLower);
        const inAgentName = ((p.agent_name || '') as string).toLowerCase().includes(sLower);
        return inTitle || inLocation || inArea || inDesc || inDeveloper || inAgentName;
      });
      console.log(`✅ After search filter: ${filtered.length}`);
    }

    // Sorting
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

    console.log(`🎯 Final filtered: ${filtered.length} properties`);
    setFilteredProperties(filtered);
  }, [
    allProperties, action, category, type, area, developer, minPrice, maxPrice,
    beds, baths, minSqft, maxSqft, furnished, parking, propertyAge, completion,
    features, search, hasVideo, sortBy
  ]);

  // Handle form changes
  const handleInputChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add all non-empty form values to URL params
    Object.entries(formState).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    // Add other params that are not in formState
    if (parking) params.set('parking', parking);
    if (propertyAge) params.set('propertyAge', propertyAge);
    if (features) params.set('features', features);
    if (subtype) params.set('subtype', subtype);
    if (developer) params.set('developer', developer);
    if (minSqft) params.set('minSqft', minSqft);
    if (maxSqft) params.set('maxSqft', maxSqft);
    
    // Always keep view mode
    params.set('view', viewMode);
    params.set('sortBy', sortBy);
    
    // Reset to page 1 when applying new filters
    params.set('page', '1');
    
    router.push(`/properties?${params.toString()}`);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFormState({
      action: 'rent',
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
    
    router.push('/properties?view=grid&sortBy=featured&action=rent&page=1');
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };

  // Handle view change
  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/properties?${params.toString()}`);
  };

  // Generate dynamic title and description based on filters
  const getPageTitle = () => {
    let title = '';

    if (category === 'luxe') {
      title += 'Luxury ';
    }

    if (type) {
      const typeLabels: Record<string, string> = {
        apartment: 'Apartments',
        villa: 'Villas',
        townhouse: 'Townhouses',
        penthouse: 'Penthouses',
        studio: 'Studios',
        plot: 'Plots',
        commercial: 'Commercial Properties'
      };
      title += typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1) + 's';
    } else if (category === 'luxe') {
      title += 'Properties';
    } else {
      title += 'Properties';
    }

    title += action === 'rent' ? ' for Rent' : ' for Sale';
    title += area ? ` in ${area}` : ' in Dubai';

    return title;
  };

  const getPageDescription = () => {
    let desc = '';

    if (category === 'luxe') {
      desc += 'Discover exclusive luxury ';
    } else {
      desc += 'Find ';
    }

    if (type) {
      const typeLabels: Record<string, string> = {
        apartment: 'apartments',
        villa: 'villas',
        townhouse: 'townhouses',
        penthouse: 'penthouses',
        studio: 'studios',
        plot: 'plots',
        commercial: 'commercial properties'
      };
      desc += typeLabels[type] || type + 's';
    } else {
      desc += 'properties';
    }

    desc += action === 'rent' ? ' for rent' : ' for sale';
    desc += area ? ` in ${area}, Dubai` : ' in Dubai';
    desc += '. Browse our curated selection with detailed information and high-quality images.';

    return desc;
  };

  // Pagination calculations
  const total = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (Math.max(page, 1) - 1) * limit;
  const paginatedProperties = filteredProperties.slice(offset, offset + limit);

  console.log('📊 Display Stats:', {
    allProperties: allProperties.length,
    filteredProperties: filteredProperties.length,
    paginatedProperties: paginatedProperties.length,
    total,
    totalPages,
    page
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading rental properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80" 
            alt="Dubai Skyline" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-primary font-bold tracking-[0.3em] uppercase text-sm animate-slide-up">
              Premium Listings
            </h2>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight animate-slide-up [animation-delay:100ms]">
              {getPageTitle()}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
              {getPageDescription()}
            </p>

            {/* Property Stats */}
            <div className="flex flex-wrap justify-center gap-3 pt-4 animate-slide-up [animation-delay:300ms]">
              <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                {total} Properties Found
              </span>
              {search && (
                <span className="px-6 py-2 bg-primary/20 backdrop-blur-md text-primary rounded-full border border-primary/30 text-sm font-bold">
                  🔎 &ldquo;{search}&rdquo;
                </span>
              )}
              {area && (
                <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                  📍 {area}
                </span>
              )}
              <span className="px-6 py-2 bg-green-500/20 backdrop-blur-md text-green-500 rounded-full border border-green-500/30 text-sm font-bold">
                🏠 For Rent
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Filters Sidebar */}
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
                  {/* Search */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Keywords</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        name="search" 
                        type="text" 
                        value={formState.search}
                        onChange={(e) => handleInputChange('search', e.target.value)}
                        placeholder="Search properties..." 
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                      />
                    </div>
                  </div>

                  {/* Action Type */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Action</label>
                    <div className="grid grid-cols-2 gap-2">
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

                  {/* Property Category */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Properties' },
                        { value: 'luxe', label: 'Luxury' },
                        { value: 'ultra-luxe', label: 'Ultra Luxury' },
                        { value: 'branded', label: 'Branded Residences' }
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

                  {/* Property Type */}
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

                  {/* Location */}
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

                  {/* Price Range - For Rent properties (AED per year) */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Range (AED/year)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="minPrice"
                        type="number"
                        placeholder="Min (yearly)"
                        value={formState.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                      <input
                        name="maxPrice"
                        type="number"
                        placeholder="Max (yearly)"
                        value={formState.maxPrice}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bedrooms</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['', '0', '1', '2', '3', '4', '5'].map((val) => (
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
                            {val === '' ? 'Any' : val === '0' ? 'ST' : val}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Furnished Status - More important for rent */}
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

                  {/* Completion Status */}
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

                  {/* Property Features */}
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

                  <button type="submit" className="btn-primary !w-full !rounded-2xl !py-4 shadow-xl shadow-primary/20">
                    Apply Filters
                  </button>
                </form>
              </div>

              {/* Help Card */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-4">Need Help?</h4>
                  <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                    Our expert agents are ready to help you find your perfect rental property.
                  </p>
                  <button className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group/btn">
                    Contact Us
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Sort and View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 bg-white p-4 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 pl-4">
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  {total} Properties Found
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:block">Sort By:</label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-3 sm:px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px]"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-100 hidden sm:block mx-2" />

                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <QueueListIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            
            

            {/* Properties Grid/List from BOTH collections */}
            {filteredProperties.length > 0 ? (
              <>
                <div className={`grid gap-8 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {paginatedProperties.map((property, i) => (
                    <div key={`${property.collection}-${property.id}`} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <PropertyCard
                        property={{
                          id: String(property.id),
                          title: property.title || 'New Property',
                          price: property.price ?? 0,
                          priceLabel: 'yearly',
                          image: property.image,
                          location: property.location || `${property.area || ''}${property.city ? ', ' + property.city : ''}`,
                          beds: property.beds ?? 0,
                          baths: property.baths ?? 0,
                          sqft: property.sqft ?? 0,
                          type: property.type || 'Property',
                          featured: Boolean(property.featured),
                          currency: property.currency || 'AED',
                          status: 'rent',
                          area: property.area || undefined,
                          city: property.city || undefined,
                          video_url: property.video_url || undefined,
                          agent_name: property.agent_name || undefined,
                        }}
                      />
                      <div className="mt-2 flex gap-2">
                        {property.collection === 'agent_properties' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🤝 Agent Property
                            {property.agent_name && ` - ${property.agent_name}`}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🏠 For Rent
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
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
                <h3 className="text-2xl font-black text-slate-900 mb-2">No rental properties found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  {allProperties.length === 0 
                    ? 'No rental properties available in Firebase. Please check your database.'
                    : 'We couldn\'t find any rental properties matching your current filters.'
                  }
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-8 btn-outline !rounded-full !px-8 inline-block text-center"
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