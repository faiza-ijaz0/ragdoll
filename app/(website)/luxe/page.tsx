'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types'
import PropertyCard, { PropertyCardProperty } from '@/components/property/PropertyCard'
import {
  ViewColumnsIcon,
  QueueListIcon,
  HomeIcon,
  SparklesIcon,
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

// Function to fetch properties from 'properties' collection
async function fetchPropertiesFromMainCollection() {
  try {
    console.log('🔥 Fetching properties from main collection...');
    const propertiesRef = collection(db, 'properties');
    
    // Fetch only villa and townhouse properties
    const q = query(
      propertiesRef,
      where('type', 'in', ['villa', 'townhouse'])
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Main Collection: Found ${querySnapshot.size} properties`);
    
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

// Function to fetch properties from 'agent_properties' collection
async function fetchPropertiesFromAgentCollection() {
  try {
    console.log('🔥 Fetching properties from agent_properties collection...');
    const agentPropertiesRef = collection(db, 'agent_properties');
    
    // Fetch only villa and townhouse properties with published review_status
    const q = query(
      agentPropertiesRef,
      where('type', 'in', ['villa', 'townhouse']),
      where('review_status', '==', 'published')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`✅ Agent Collection: Found ${querySnapshot.size} properties`);
    
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
    console.log('🔄 Fetching properties from ALL collections...');
    
    // Fetch from both collections simultaneously
    const [mainProperties, agentProperties] = await Promise.all([
      fetchPropertiesFromMainCollection(),
      fetchPropertiesFromAgentCollection()
    ]);
    
    console.log(`📊 Results: ${mainProperties.length} from main, ${agentProperties.length} from agent`);
    
    // Combine both collections
    const allProperties = [...mainProperties, ...agentProperties];
    console.log(`✅ Total properties found: ${allProperties.length}`);
    
    return allProperties;
    
  } catch (error) {
    console.error('❌ Error in fetchAllProperties:', error);
    return [];
  }
}

export default function LuxuryPropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for properties
  const [allProperties, setAllProperties] = useState<NormalizedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<NormalizedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get view mode from URL
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // Fetch properties on component mount
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      console.log('🔄 Loading properties...');
      const properties = await fetchAllProperties();
      
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
        
        // Determine price label based on status
        const priceLabel = p.status === 'rent' ? 'yearly' : 'total';
        
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
          type: p.type || 'villa',
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
          collection: p.collection || 'properties'
        };
      });
      
      console.log(`✅ Normalized ${normalized.length} properties`);
      setAllProperties(normalized);
      setFilteredProperties(normalized);
      setLoading(false);
    }
    
    loadProperties();
  }, []);

  // Handle view change
  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    params.set('page', '1');
    router.push(`/luxury-properties?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/luxury-properties?${params.toString()}`);
  };

  // Pagination calculations
  const total = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (Math.max(page, 1) - 1) * limit;
  const paginatedProperties = filteredProperties.slice(offset, offset + limit);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-600 font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80" 
            alt="Luxury Villa" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/90 via-amber-900/80 to-amber-900" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-400/30 mb-4">
              <SparklesIcon className="h-5 w-5 text-amber-300" />
              <h2 className="text-amber-300 font-bold tracking-[0.3em] uppercase text-sm">
                Villa & Townhouse Collection
              </h2>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight animate-slide-up [animation-delay:100ms]">
              Premium Properties
            </h1>
            
            <p className="text-lg md:text-xl text-amber-200 max-w-3xl mx-auto font-medium animate-slide-up [animation-delay:200ms]">
              Discover Dubai's finest collection of villas and townhouses. 
              Curated for those who appreciate exceptional living experiences.
            </p>

            {/* Property Stats */}
            <div className="flex flex-wrap justify-center gap-3 pt-6 animate-slide-up [animation-delay:300ms]">
              <span className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 text-sm font-bold">
                {total} Properties
              </span>
              {filteredProperties.some(p => p.collection === 'agent_properties') && (
                <span className="px-6 py-2 bg-blue-500/20 backdrop-blur-md text-blue-300 rounded-full border border-blue-400/30 text-sm font-bold">
                  🤝 Agent Properties Included
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8 sm:py-16">
        <div className="flex flex-col">
          {/* View Controls Only - NO FILTERS */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 bg-white p-4 sm:p-4 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-4 pl-4">
              <span className="text-amber-400 font-bold text-sm uppercase tracking-widest">
                {total} Properties Found
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-amber-50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleViewChange('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-500' : 'text-amber-400 hover:text-amber-600'}`}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-500' : 'text-amber-400 hover:text-amber-600'}`}
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
                {paginatedProperties.map((property, i) => (
                  <div key={`${property.collection}-${property.id}`} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="relative">
                      <PropertyCard
                        property={{
                          id: String(property.id),
                          title: property.title || 'Property',
                          price: property.price ?? 0,
                          priceLabel: property.status === 'rent' ? 'yearly' : 'total',
                          image: property.image,
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
                      
                      {/* Property Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg">
                          {property.type === 'villa' ? '🏰 Villa' : '🏘️ Townhouse'}
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all font-bold shadow-sm"
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
                              ? 'bg-amber-500 text-white shadow-amber-500/20' 
                              : 'bg-white border border-amber-100 text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="text-amber-300">...</span>;
                    }
                    return null;
                  })}

                  {page < totalPages && (
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all font-bold shadow-sm"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-amber-100 shadow-sm">
              <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-12 w-12 text-amber-300" />
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-2">No properties found</h3>
              <p className="text-amber-500 font-medium max-w-xs mx-auto">
                No villas or townhouses available at the moment. Please check back soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simple CTA Section */}
      <section className="bg-gradient-to-r from-amber-900 to-amber-800 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Find Your Dream Home
            </h2>
            <p className="text-lg text-amber-200 mb-8 max-w-2xl mx-auto">
              Browse our collection of premium villas and townhouses from both our main listings and agent submissions.
            </p>
            <button className="px-8 py-4 bg-white text-amber-900 font-bold rounded-full hover:bg-amber-100 transition-all shadow-lg">
              Contact for More Information
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}