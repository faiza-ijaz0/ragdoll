'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import ValuationModal, { ValuationData } from '../forms/ValuationModal'

import { useTranslation } from 'react-i18next'
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  StarIcon,
  ChevronDownIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'

const dubaiAreas = [
  { name: 'Dubai Marina', image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=400&q=80' },
  { name: 'Downtown Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80' },
  { name: 'Palm Jumeirah', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80' },
  { name: 'Business Bay', image: 'https://images.unsplash.com/photo-1549944850-84e00be4203b?w=400&q=80' },
  { name: 'Jumeirah', image: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=400&q=80' },
  { name: 'Dubai Hills Estate', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80' },
  { name: 'Dubai Creek Harbour', image: 'https://images.unsplash.com/photo-1614605242014-c6419091c3fd?w=400&q=80' },
  { name: 'Emirates Hills', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80' },
  { name: 'Arabian Ranches', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80' },
  { name: 'Dubai South', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80' },
  { name: 'Al Barsha', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80' },
  { name: 'Dubai Silicon Oasis', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80' },
  { name: 'Deira', image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80' },
  { name: 'Jumeirah Beach Residence', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80' },
  { name: 'Dubai Islands', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80' },
]

interface NavSubItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  subItems?: NavSubItem[]
}

interface NavSection {
  label: string
  hasDropdown: boolean
  href?: string
  items?: NavItem[]
  isValuation?: boolean
}

export default function Header() {
  const { user, profile } = useAuth()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBuyOpen, setIsBuyOpen] = useState(false)
  const [isRentOpen, setIsRentOpen] = useState(false)
  const [isLuxeOpen, setIsLuxeOpen] = useState(false)
  const [isCommercialOpen, setIsCommercialOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false)

  // Hide header on login pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/auth/')

  if (isAuthPage) return null

  const navigation: NavSection[] = [
    {
      label: t('header.navigation.newProjects'),
      hasDropdown: false,
      href: '/projects'
    },

    {
      label: t('header.navigation.buy'),
      hasDropdown: true,
      items: [
        {
          label: 'Property Types',
          href: '/properties?action=buy',
          subItems: [
            { label: 'All Properties', href: '/properties?action=buy' },
            { label: 'Apartments', href: '/properties?action=buy&type=apartment' },
            { label: 'Villas', href: '/properties?action=buy&type=villa' },
            { label: 'Townhouses', href: '/properties?action=buy&type=townhouse' },
            { label: 'Penthouses', href: '/properties?action=buy&type=penthouse' },
            { label: 'Studios', href: '/properties?action=buy&type=studio' },
            { label: 'Landmarks', href: '/properties?action=buy&feature=landmark' }
          ]
        },
        {
          label: 'Popular Areas',
          href: '/properties?action=buy',
          subItems: dubaiAreas.map(area => ({
            label: area.name,
            href: `/properties?action=buy&area=${area.name.toLowerCase().replace(/\s+/g, '-')}`
          }))
        }
      ]
    },

    {
      label: t('header.navigation.rent'),
      hasDropdown: true,
      items: [
        {
          label: 'Property Types',
          href: '/rent',
          subItems: [
            { label: 'All Properties', href: '/properties?action=rent' },
            { label: 'Apartments', href: '/properties?action=rent&type=apartment' },
            { label: 'Villas', href: '/properties?action=rent&type=villa' },
            { label: 'Townhouses', href: '/properties?action=rent&type=townhouse' },
            { label: 'Penthouses', href: '/properties?action=rent&type=penthouse' },
            { label: 'Studios', href: '/properties?action=rent&type=studio' }
          ]
        },
        {
          label: 'Popular Areas',
          href: '/rent',
          subItems: dubaiAreas.map(area => ({
            label: area.name,
            href: `/properties?action=rent&area=${area.name.toLowerCase().replace(/\s+/g, '-')}`
          }))
        }
      ]
    },

    {
      label: 'Luxe',
      hasDropdown: true,
      items: [
        {
          label: 'Luxury Collections',
          href: '/luxe',
          subItems: [
            { label: 'All Luxury', href: '/properties?category=luxe' },
            { label: 'Beachfront', href: '/properties?category=luxe&feature=beachfront' },
            { label: 'Private Pools', href: '/properties?category=luxe&feature=pool' },
            { label: 'Smart Homes', href: '/properties?category=luxe&feature=smart-home' },
            { label: 'Golf Communities', href: '/properties?category=luxe&feature=golf' }
          ]
        },
        {
          label: 'Premium Areas',
          href: '/luxe',
          subItems: [
            { label: 'Dubai Marina', href: '/properties?category=luxe&area=dubai-marina' },
            { label: 'Palm Jumeirah', href: '/properties?category=luxe&area=palm-jumeirah' },
            { label: 'Downtown Dubai', href: '/properties?category=luxe&area=downtown-dubai' },
            { label: 'Emirates Hills', href: '/properties?category=luxe&area=emirates-hills' },
            { label: 'Arabian Ranches', href: '/properties?category=luxe&area=arabian-ranches' },
            { label: 'Dubai Hills Estate', href: '/properties?category=luxe&area=dubai-hills-estate' }
          ]
        }
      ]
    },

    {
      label: t('header.navigation.commercial'),
      hasDropdown: true,
      items: [
        {
          label: 'Commercial Types',
          href: '/commercial',
          subItems: [
            { label: 'All Commercial', href: '/properties?action=buy&type=commercial' },
            { label: 'Office Spaces', href: '/properties?action=buy&type=commercial&subtype=office' },
            { label: 'Retail Shops', href: '/properties?action=buy&type=commercial&subtype=retail' },
            { label: 'Warehouses', href: '/properties?action=buy&type=commercial&subtype=warehouse' },
            { label: 'Co-working', href: '/properties?action=buy&type=commercial&subtype=coworking' }
          ]
        },
        {
          label: 'Business Districts',
          href: '/commercial',
          subItems: [
            { label: 'Business Bay', href: '/properties?action=buy&type=commercial&area=business-bay' },
            { label: 'DIFC', href: '/properties?action=buy&type=commercial&area=difc' },
            { label: 'Dubai Silicon Oasis', href: '/properties?action=buy&type=commercial&area=dubai-silicon-oasis' },
            { label: 'Deira', href: '/properties?action=buy&type=commercial&area=deira' },
            { label: 'Dubai South', href: '/properties?action=buy&type=commercial&area=dubai-south' }
          ]
        }
      ]
    },

    { label: t('header.navigation.agents'), href: '/agents', hasDropdown: false },
    {
      label: t('header.navigation.services'),
      hasDropdown: true,
      items: [
        { label: t('header.navigation.propertyManagementService'), href: '/services#property-management' },
        { label: t('header.navigation.snaggingAndHandover'), href: '/services#snagging' },
        { label: t('header.navigation.allServices'), href: '/services' }
      ]
    },
    {
      label: t('header.navigation.more'),
      hasDropdown: true,
      items: [
        { label: t('partner'), href: '/partners' },
        { label: t('clients'), href: '/clients' },
        { label: t('header.navigation.news'), href: '/news' },
        { label: t('header.navigation.guides'), href: '/guides' },
        { label: t('header.navigation.whyInvestInDubai'), href: '/why-invest-dubai' }
      ]
    }
  ]

  const handleValuationSubmit = async (data: ValuationData) => {
    // For now, just log the data. In a real implementation, this would send to an API
    console.log('Valuation request:', data)
    // You could add a toast notification here or redirect to a thank you page
    alert('Thank you for your valuation request! Our team will contact you soon.')
  }

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        "bg-white/95 backdrop-blur-lg py-5"
      )}
    >
      {/* Backdrop Overlay for Mega Menu */}
      {(isBuyOpen || isRentOpen || isLuxeOpen || isCommercialOpen || isServicesOpen || isMoreOpen) && (
        <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-[-1]" />
      )}
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center group">
          <span className="text-3xl font-serif font-bold tracking-tight text-secondary group-hover:text-primary transition-colors">
            Ragdoll
          </span>
          <span className="text-xs font-light text-secondary/70 tracking-wider uppercase">
            Properties
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3">
          {navigation.map((item) => (
            <div key={item.label} className="relative">
              {item.hasDropdown ? (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (item.label === 'Buy') setIsBuyOpen(true)
                    else if (item.label === 'Rent') setIsRentOpen(true)
                    else if (item.label === 'Luxe') setIsLuxeOpen(true)
                    else if (item.label === 'Commercial') setIsCommercialOpen(true)
                    else if (item.label === 'Services') setIsServicesOpen(true)
                    else if (item.label === 'More') setIsMoreOpen(true)
                  }}
                  onMouseLeave={() => {
                    if (item.label === 'Buy') setIsBuyOpen(false)
                    else if (item.label === 'Rent') setIsRentOpen(false)
                    else if (item.label === 'Luxe') setIsLuxeOpen(false)
                    else if (item.label === 'Commercial') setIsCommercialOpen(false)
                    else if (item.label === 'Services') setIsServicesOpen(false)
                    else if (item.label === 'More') setIsMoreOpen(false)
                  }}
                >
                  <button
                    className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-all hover:text-primary cursor-pointer text-secondary"
                    onClick={() => {
                      if (item.label === 'Buy') setIsBuyOpen(!isBuyOpen)
                      else if (item.label === 'Rent') setIsRentOpen(!isRentOpen)
                      else if (item.label === 'Luxe') setIsLuxeOpen(!isLuxeOpen)
                      else if (item.label === 'Commercial') setIsCommercialOpen(!isCommercialOpen)
                      else if (item.label === 'Services') setIsServicesOpen(!isServicesOpen)
                      else if (item.label === 'More') setIsMoreOpen(!isMoreOpen)
                    }}
                  >
                    {item.label}
                    <ChevronDownIcon className={cn("h-4 w-4 transition-transform", 
                      ((item.label === 'Buy' && isBuyOpen) ||
                      (item.label === 'Rent' && isRentOpen) ||
                      (item.label === 'Luxe' && isLuxeOpen) ||
                      (item.label === 'Commercial' && isCommercialOpen) ||
                      (item.label === 'Services' && isServicesOpen) ||
                      (item.label === 'More' && isMoreOpen)) && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={cn(
                    "bg-white shadow-2xl transition-all duration-300 z-50 top-full",
                    // Compact dropdown for Services and More
                    (item.label === 'Services' || item.label === 'More') 
                      ? "absolute right-0 w-64 py-4 rounded-xl mt-2"
                      : "fixed left-0 right-0 w-screen py-12",
                    (item.label === 'Buy' && isBuyOpen) ||
                    (item.label === 'Rent' && isRentOpen) ||
                    (item.label === 'Luxe' && isLuxeOpen) ||
                    (item.label === 'Commercial' && isCommercialOpen) ||
                    (item.label === 'Services' && isServicesOpen) ||
                    (item.label === 'More' && isMoreOpen)
                      ? "opacity-100 scale-100 translate-y-0 visible" 
                      : "opacity-0 scale-95 -translate-y-2 invisible"
                  )}>
                    <div className={cn(
                      (item.label === 'Services' || item.label === 'More') 
                        ? "px-4" 
                        : "container-custom mx-auto grid grid-cols-12 gap-12"
                    )}>
                      {/* Compact dropdown for Services and More */}
                      {(item.label === 'Services' || item.label === 'More') ? (
                        <div className="space-y-1">
                          {item.items?.map((navItem) => (
                            <Link
                              key={navItem.label}
                              href={navItem.href}
                              className="block px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                              onClick={() => {
                                if (item.label === 'Services') setIsServicesOpen(false)
                                else if (item.label === 'More') setIsMoreOpen(false)
                              }}
                            >
                              {navItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        // Full mega menu for Buy, Rent, Luxe, Commercial
                        item.items?.map((navItem, index) => {
                          const isAreaList = navItem.label === 'Popular Areas';
                          
                          return (
                            <div 
                              key={navItem.label} 
                              className={cn(
                                isAreaList ? "col-span-6" : "col-span-3"
                              )}
                            >
                              <Link
                                href={navItem.href}
                                className="block text-lg font-bold text-secondary hover:text-primary transition-all border-b border-slate-100 pb-3 mb-6"
                                onClick={() => {
                                  if (item.label === 'Buy') setIsBuyOpen(false)
                                  else if (item.label === 'Rent') setIsRentOpen(false)
                                  else if (item.label === 'Luxe') setIsLuxeOpen(false)
                                  else if (item.label === 'Commercial') setIsCommercialOpen(false)
                                }}
                              >
                                {navItem.label}
                              </Link>
                              {navItem.subItems && (
                                <div className={cn(
                                  isAreaList ? "grid grid-cols-3 gap-x-6 gap-y-4" : "space-y-3"
                                )}>
                                  {navItem.subItems.map((subItem, subIndex) => {
                                    const areaInfo = dubaiAreas.find(a => a.name === subItem.label);
                                    return (
                                      <Link
                                        key={subItem.label}
                                        href={subItem.href}
                                        className="group flex items-center gap-3 transition-all p-1 rounded-xl hover:bg-slate-50"
                                        onClick={() => {
                                          if (item.label === 'Buy') setIsBuyOpen(false)
                                          else if (item.label === 'Rent') setIsRentOpen(false)
                                          else if (item.label === 'Luxe') setIsLuxeOpen(false)
                                          else if (item.label === 'Commercial') setIsCommercialOpen(false)
                                        }}
                                      >
                                        {areaInfo && isAreaList && (
                                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                                            <img 
                                              src={areaInfo.image} 
                                              alt={subItem.label} 
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                          </div>
                                        )}
                                        <span className={cn(
                                          isAreaList ? "text-xs font-bold text-secondary group-hover:text-primary leading-tight" : "text-sm text-slate-600 hover:text-primary font-medium"
                                        )}>
                                          {subItem.label}
                                        </span>
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : item.isValuation ? (
                <button
                  onClick={() => setIsValuationModalOpen(true)}
                  className="text-sm font-bold uppercase tracking-widest transition-all hover:text-primary relative group text-secondary"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="text-sm font-bold uppercase tracking-widest transition-all hover:text-primary relative group text-secondary"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
         


           <Link
           href="/customer/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <CalculatorIcon className="h-4 w-4" />
            Valuation
          </Link>








          {user ? (
            <Link 
              href={profile?.role === 'admin' ? '/admin' : profile?.role === 'agent' ? '/agent/dashboard' : '/customer/dashboard'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-secondary text-white hover:bg-primary hover:text-secondary"
            >
              <UserIcon className="h-4 w-4" />
              Portal
            </Link>
          ) : (
            <Link 
              href="/admin/login"
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all bg-secondary text-white hover:bg-primary hover:text-secondary"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl transition-colors text-secondary"
          >
            {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[88px] bg-white z-50 animate-slideDown overflow-y-auto">
          <nav className="flex flex-col p-6 gap-8 max-h-full">
            {/* Main Navigation Items */}
            <div className="space-y-6">
              {/* New Projects - Simple Link */}
              <Link
                href="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 px-4 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all group"
              >
                <span className="text-lg font-bold text-secondary group-hover:text-white">
                  {t('header.navigation.newProjects')}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-white rotate-[-90deg]" />
              </Link>

              {/* Buy Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t('header.navigation.buy')}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Property Types</div>
                  <Link href="/properties?action=buy" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    All Properties
                  </Link>
                  <Link href="/properties?action=buy&type=apartment" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Apartments
                  </Link>
                  <Link href="/properties?action=buy&type=villa" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Villas
                  </Link>
                  <Link href="/properties?action=buy&type=townhouse" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Townhouses
                  </Link>
                  <Link href="/properties?action=buy&type=penthouse" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Penthouses
                  </Link>
                  <Link href="/properties?action=buy&type=studio" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Studios
                  </Link>
                  <Link href="/properties?action=buy&feature=landmark" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Landmarks
                  </Link>
                  
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Popular Areas</div>
                  {dubaiAreas.slice(0, 8).map(area => (
                    <Link 
                      key={area.name}
                      href={`/properties?action=buy&area=${area.name.toLowerCase().replace(/\s+/g, '-')}`} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rent Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t('header.navigation.rent')}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Property Types</div>
                  <Link href="/properties?action=rent" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    All Properties
                  </Link>
                  <Link href="/properties?action=rent&type=apartment" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Apartments
                  </Link>
                  <Link href="/properties?action=rent&type=villa" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Villas
                  </Link>
                  <Link href="/properties?action=rent&type=townhouse" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Townhouses
                  </Link>
                  <Link href="/properties?action=rent&type=penthouse" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Penthouses
                  </Link>
                  <Link href="/properties?action=rent&type=studio" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Studios
                  </Link>
                  
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Popular Areas</div>
                  {dubaiAreas.slice(0, 8).map(area => (
                    <Link 
                      key={area.name}
                      href={`/properties?action=rent&area=${area.name.toLowerCase().replace(/\s+/g, '-')}`} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Luxe Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  Luxe
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Luxury Collections</div>
                  <Link href="/properties?category=luxe" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    All Luxury
                  </Link>
                  <Link href="/properties?category=luxe&feature=beachfront" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Beachfront
                  </Link>
                  <Link href="/properties?category=luxe&feature=pool" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Private Pools
                  </Link>
                  <Link href="/properties?category=luxe&feature=smart-home" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Smart Homes
                  </Link>
                  <Link href="/properties?category=luxe&feature=golf" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Golf Communities
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Premium Areas</div>
                  <Link href="/properties?category=luxe&area=dubai-marina" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Dubai Marina
                  </Link>
                  <Link href="/properties?category=luxe&area=palm-jumeirah" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Palm Jumeirah
                  </Link>
                  <Link href="/properties?category=luxe&area=downtown-dubai" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Downtown Dubai
                  </Link>
                  <Link href="/properties?category=luxe&area=emirates-hills" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Emirates Hills
                  </Link>
                </div>
              </div>

              {/* Commercial Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t('header.navigation.commercial')}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Commercial Types</div>
                  <Link href="/properties?action=buy&type=commercial" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    All Commercial
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&subtype=office" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Office Spaces
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&subtype=retail" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Retail Shops
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&subtype=warehouse" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Warehouses
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&subtype=coworking" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Co-working
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">Business Districts</div>
                  <Link href="/properties?action=buy&type=commercial&area=business-bay" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Business Bay
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&area=difc" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    DIFC
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&area=dubai-silicon-oasis" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Dubai Silicon Oasis
                  </Link>
                  <Link href="/properties?action=buy&type=commercial&area=deira" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50">
                    Deira
                  </Link>
                </div>
              </div>

              {/* Services Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t('header.navigation.services')}
                </div>
                <div className="space-y-2">
                  <Link href="/services/property-management" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.propertyManagement')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                  <Link href="/services/consultation" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.consultation')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                  <Link href="/services/investment" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.investment')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>

              {/* More Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t('header.navigation.more')}
                </div>
                <div className="space-y-2">
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.about')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                  <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.blog')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                  <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all">
                    <span className="text-base font-bold text-secondary">{t('header.navigation.contact')}</span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsValuationModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-4 bg-primary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg"
              >
                <CalculatorIcon className="h-5 w-5" />
                {t('header.navigation.valuation')}
              </button>

              {user ? (
                <Link
                  href={profile?.role === 'admin' ? '/admin' : profile?.role === 'agent' ? '/agent/dashboard' : '/customer/dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-secondary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all shadow-lg block"
                >
                  <UserIcon className="h-5 w-5" />
                  Portal
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-secondary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all shadow-lg block"
                >
                  <UserIcon className="h-5 w-5" />
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Valuation Modal */}
      <ValuationModal
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        onSubmit={handleValuationSubmit}
      />
    </header>
  )
}


