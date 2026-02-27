"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ValuationModal, { ValuationData } from "../forms/ValuationModal";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useTranslation } from "react-i18next";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  StarIcon,
  ChevronDownIcon,
  CalculatorIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const dubaiAreas = [
  {
    name: "Dubai Marina",
    image:
      "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=400&q=80",
  },
  {
    name: "Downtown Dubai",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
  },
  {
    name: "Palm Jumeirah",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
  },
  {
    name: "Business Bay",
    image:
      "https://images.unsplash.com/photo-1549944850-84e00be4203b?w=400&q=80",
  },
  {
    name: "Jumeirah",
    image:
      "https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=400&q=80",
  },
  {
    name: "Dubai Hills Estate",
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80",
  },
  {
    name: "Dubai Creek Harbour",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
  },
  {
    name: "Emirates Hills",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
  },
  {
    name: "Arabian Ranches",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
  },
  {
    name: "Dubai South",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80",
  },
  {
    name: "Al Barsha",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80",
  },
  {
    name: "Dubai Silicon Oasis",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
  },
  {
    name: "Deira",
    image:
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80",
  },
  {
    name: "Jumeirah Beach Residence",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80",
  },
  {
    name: "Dubai Islands",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
  },
];

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  label: string;
  hasDropdown: boolean;
  href?: string;
  items?: NavItem[];
  isValuation?: boolean;
}

export default function Header() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isRentOpen, setIsRentOpen] = useState(false);
  const [isLuxeOpen, setIsLuxeOpen] = useState(false);
  const [isCommercialOpen, setIsCommercialOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    router.push("/");
  };





  useEffect(() => {
  if (isMobileMenuOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isMobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileDropdownOpen]);

  // Hide header on login pages
  const isAuthPage =
    pathname?.includes("/login") ||
    pathname?.includes("/signup") ||
    pathname?.includes("/auth/");

  if (isAuthPage) return null;

  const navigation: NavSection[] = [
    {
      label: t("header.navigation.newProjects"),
      hasDropdown: false,
      href: "/projects",
    },

  {
  label: t("header.navigation.buy"),
  hasDropdown: true,
  items: [
    {
      label: "Property Types",
      href: "/sale",
      subItems: [
        { label: "All Properties", href: "/sale?action=buy" },
        {
          label: "Apartments",
          href: "/sale?action=buy&type=apartment",
        },
        { label: "Villas", href: "/sale?action=buy&type=villa" },
        {
          label: "Townhouses",
          href: "/sale?action=buy&type=townhouse",
        },
        { label: "plot", href: "/sale?action=buy&type=plot" },
        {
          label: "Studios",
          href: "/sale?action=buy&type=furnished-studio",
        },
        {
          label: "residential plot",
          href: "/sale?action=buy&type=residential-plot",
        },
        {
          label: "industrial plot",
          href: "/sale?action=buy&type=industrial-plot",
        },
        {
          label: "commercial",
          href: "/sale?action=buy&type=commercial",
        },
      ],
    },
    {
      label: "Popular Areas",
      href: "/sale",
      subItems: dubaiAreas.map((area) => ({
        label: area.name,
        href: `/sale?action=buy&area=${area.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      })),
    },
  ],
},




    {
      label: t("header.navigation.rent"),
      hasDropdown: true,
      items: [
        {
          label: "Property Types",
          href: "/rent",
          subItems: [
            { label: "All Properties", href: "/rent?action=rent" },
            {
              label: "Apartments",
              href: "/rent?action=rent&type=apartment",
            },
            { label: "Villas", href: "/rent?action=rent&type=villa" },
            {
              label: "Townhouses",
              href: "/rent?action=rent&type=townhouse",
            },
            {
              label: "Plot",
              href: "/rent?action=rent&type=plot",
            },
            {
              label: "commercial",
              href: "/rent?action=rent&type=commercial",
            },
            {
              label: "residential plot",
              href: "/rent?action=rent&type=residential-plot",
            },
            {
              label: "industrial plot",
              href: "/rent?action=rent&type=industrial-plot",
            },
            {
              label: "Studios",
              href: "/rent?action=rent&type=furnished-studio",
            },
          ],
        },
        {
          label: "Popular Areas",
          href: "/rent",
          subItems: dubaiAreas.map((area) => ({
            label: area.name,
            href: `/rent?action=rent&area=${area.name
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
          })),
        },
      ],
    },

    {
  label: "Luxe",
  hasDropdown: true,
  items: [
    {
      label: "All Properties",
      href: "/luxe",
      subItems: [
        { label: "All Properties", href: "/luxe" },
        { label: "For Rent", href: "/luxe?action=rent" },
        { label: "For Sale", href: "/luxe?action=buy" },
      ],
    },
    {
      label: "Property Types",
      href: "/luxe",
      subItems: [
        { label: "All Types", href: "/luxe" },
        { label: "Apartments", href: "/luxe?type=apartment" },
        { label: "Villas", href: "/luxe?type=villa" },
        { label: "Townhouses", href: "/luxe?type=townhouse" },
        { label: "Penthouses", href: "/luxe?type=penthouse" },
        { label: "Studios", href: "/luxe?type=studio" },
        { label: "Plots", href: "/luxe?type=plot" },
        { label: "Commercial", href: "/luxe?type=commercial" },
        { label: "Furnished Studios", href: "/luxe?type=furnished-studio" },
      ],
    },
    
    {
      label: "Popular Areas",
      href: "/luxe",
      subItems: [
        { label: "Dubai Marina", href: "/luxe?area=dubai-marina" },
        { label: "Palm Jumeirah", href: "/luxe?area=palm-jumeirah" },
        { label: "Downtown Dubai", href: "/luxe?area=downtown-dubai" },
        { label: "Emirates Hills", href: "/luxe?area=emirates-hills" },
        { label: "Arabian Ranches", href: "/luxe?area=arabian-ranches" },
        { label: "Dubai Hills Estate", href: "/luxe?area=dubai-hills-estate" },
        { label: "Business Bay", href: "/luxe?area=business-bay" },
        { label: "Jumeirah", href: "/luxe?area=jumeirah" },
        { label: "Dubai Creek Harbour", href: "/luxe?area=dubai-creek-harbour" },
        { label: "Al Barsha", href: "/luxe?area=al-barsha" },
      ],
    },
    
  ],
},
{
  label: t("header.navigation.commercial"),
  hasDropdown: true,
  items: [
    {
      label: "All Commercial",
      href: "/commercial",
      subItems: [
        { label: "All Commercial Properties", href: "/commercial" },
        { label: "For Rent", href: "/commercial?action=rent" },
        { label: "For Sale", href: "/commercial?action=buy" },
      ],
    },
    {
      label: "Commercial Types",
      href: "/commercial",
      subItems: [
        { label: "All Types", href: "/commercial" },
        { label: "Offices", href: "/commercial?type=office" },
        { label: "Retail / Shops", href: "/commercial?type=shop" },
        { label: "Warehouses", href: "/commercial?type=warehouse" },
        { label: "Industrial", href: "/commercial?type=industrial" },
        { label: "Commercial Buildings", href: "/commercial?type=building" },
        { label: "Commercial Plots", href: "/commercial?type=plot" },
      ],
    },
    {
      label: "Business Districts",
      href: "/commercial",
      subItems: [
        { label: "Business Bay", href: "/commercial?area=business-bay" },
        { label: "DIFC", href: "/commercial?area=difc" },
        { label: "Dubai Silicon Oasis", href: "/commercial?area=dubai-silicon-oasis" },
        { label: "Deira", href: "/commercial?area=deira" },
        { label: "Dubai South", href: "/commercial?area=dubai-south" },
        { label: "Dubai Marina", href: "/commercial?area=dubai-marina" },
        { label: "Downtown Dubai", href: "/commercial?area=downtown-dubai" },
        { label: "Jumeirah", href: "/commercial?area=jumeirah" },
        { label: "Al Barsha", href: "/commercial?area=al-barsha" },
        { label: "Dubai Creek Harbour", href: "/commercial?area=dubai-creek-harbour" },
      ],
    },
   
   
  ],
},
    {
      label: "Sell",
      hasDropdown: false,
      href: "/sell",
    },

    {
      label: t("header.navigation.agents"),
      href: "/agents",
      hasDropdown: false,
    },
    
    {
      label: t("header.navigation.services"),
      hasDropdown: false,
      href: "/services",
    },

    {
      label: "Trends",
      hasDropdown: true,
      items: [
        {
          label: "Market Insights",
          href: "/trends/market-insights",
          subItems: [
            { label: "Investment Analysis", href: "/trends/investment-analysis" },
            { label: "Top Investment Areas", href: "/trends/top-investment-areas" },
            { label: "Dubai Projects Map", href: "/trends/dubai-projects-map" },
            { label: "New Developments", href: "/trends/new-developments" },
          ],
        },
        {
          label: "Market Data",
          href: "/trends/market-data",
          subItems: [
            { label: "Dubai population", href: "/trends/dubai-population" },
            { label: "Market Performance", href: "/trends/market-performance" },
            { label: "Transactions & Supply", href: "/trends/transactions-supply" },
            { label: "Monthly Market Updates", href: "/trends/monthly-updates" },
            { label: "Quarterly Market Updates", href: "/trends/quarterly-updates" },
            { label: "Yearly Market Updates", href: "/trends/yearly-updates" },
          ],
        },
        {
          label: "Tools",
          href: "/trends/tools",
          subItems: [
            { label: "Calculator", href: "/trends/calculator" },
            { label: "Projects", href: "/trends/projects" },
          ],
        },
      ],
    },

    {
      label: t("header.navigation.more"),
      hasDropdown: true,
      items: [
        {
          label: "Market Insights",
          href: "/market",
          subItems: [
            { label: "Investments Map", href: "/market/investments-map" },
            { label: "Projects Sales Transactions", href: "/market/projects-sales" },
            { label: "Market Performance 2024", href: "/market/performance-2024" },
            { label: "Dubai Properties Prices 2024", href: "/market/prices-2024" },
            { label: "Dubai Property Supply", href: "/market/property-supply" },
            { label: "Properties Prices Index", href: "/market/prices-index" },
            { label: "Dubai In Numbers", href: "/market/dubai-numbers" },
            { label: "Best Property Investments In Dubai", href: "/market/best-investments" },
          ],
        },
        {
          label: "Resources & Information",
          href: "/resources",
          subItems: [
            { label: t("header.navigation.guides"), href: "/guides" },
            { label: t("header.navigation.news"), href: "/news" },
            { label: t("header.navigation.whyInvestInDubai"), href: "/why-invest-dubai" },
            { label: "FAQs", href: "/faqs" },
            { label: "Blog", href: "/blog" },
          ],
        },
        {
          label: "Company",
          href: "/company",
          subItems: [
            { label: "Partner", href: "/partners" },
            { label: "Clients", href: "/clients" },
            { label: t("header.navigation.about"), href: "/about" },
            { label: t("header.navigation.contact"), href: "/contact" },
          ],
        },
      ],
    },
  ];

  // Enhanced: handleValuationSubmit with real-time database integration
  const handleValuationSubmit = async (data: ValuationData) => {
    try {
      console.log("Processing valuation request:", data);
      
      // Prepare data for submission
      const formData = {
        type: 'valuation_request',
        full_name: data.full_name?.trim() || '',
        email: data.email?.trim() || '',
        phone: data.phone?.trim() || '',
        message: data.message?.trim() || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user?.uid || null
      };
      
      // Try API endpoint first for better real-time handling
      try {
        const response = await fetch('/api/customer/valuations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Valuation saved via API:', result);
          alert("✓ Thank you for your valuation request! Our team will contact you soon.");
          setIsValuationModalOpen(false);
          return;
        }
      } catch (apiError) {
        console.warn('API endpoint not available, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase if API endpoint is not available
      console.log("Saving to Firebase as fallback:", formData);
      const requestInfoRef = collection(db, 'request_information');
      const docRef = await addDoc(requestInfoRef, formData);
      console.log('Valuation saved to Firebase with ID:', docRef.id);
      
      alert("✓ Thank you for your valuation request! Our team will contact you soon.");
      setIsValuationModalOpen(false);
      
    } catch (error) {
      console.error('Error saving valuation request:', error);
      alert("✗ Something went wrong. Please try again.");
      throw error;
    }
  };

  return (
<header
  className={cn(
    "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
    "bg-white/95 backdrop-blur-lg py-4"
  )}
>












      
      {/* Backdrop Overlay for Mega Menu */}
      {(isBuyOpen ||
        isRentOpen ||
        isLuxeOpen ||
        isCommercialOpen ||
        isServicesOpen ||
        isTrendsOpen ||
        isMoreOpen) && (
        <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-[-1]" />
      )}
      <div className="container-custom flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
<Link href="/" className="flex items-center group shrink-0">
      <img 
        src="/ragdol.png" 
        alt="Ragdol Logo" 
        className="h-10 w-auto rounded-xl group-hover:opacity-90 transition-opacity"
      />
    </Link>
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center px-">
          {navigation.map((item) => (
            <div key={item.label} className="relative">
              {item.hasDropdown ? (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (item.label === "Buy") setIsBuyOpen(true);
                    else if (item.label === "Rent") setIsRentOpen(true);
                    else if (item.label === "Luxe") setIsLuxeOpen(true);
                    else if (item.label === "Commercial")
                      setIsCommercialOpen(true);
                    else if (item.label === "Services") setIsServicesOpen(true);
                    else if (item.label === "Trends") setIsTrendsOpen(true);
                    else if (item.label === "More") setIsMoreOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (item.label === "Buy") setIsBuyOpen(false);
                    else if (item.label === "Rent") setIsRentOpen(false);
                    else if (item.label === "Luxe") setIsLuxeOpen(false);
                    else if (item.label === "Commercial")
                      setIsCommercialOpen(false);
                    else if (item.label === "Services")
                      setIsServicesOpen(false);
                    else if (item.label === "Trends")
                      setIsTrendsOpen(false);
                    else if (item.label === "More") setIsMoreOpen(false);
                  }}
                >
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all hover:text-primary hover:bg-slate-50 cursor-pointer text-secondary"
                    onClick={() => {
                      if (item.label === "Buy") setIsBuyOpen(!isBuyOpen);
                      else if (item.label === "Rent")
                        setIsRentOpen(!isRentOpen);
                      else if (item.label === "Luxe")
                        setIsLuxeOpen(!isLuxeOpen);
                      else if (item.label === "Commercial")
                        setIsCommercialOpen(!isCommercialOpen);
                      else if (item.label === "Services")
                        setIsServicesOpen(!isServicesOpen);
                      else if (item.label === "Trends")
                        setIsTrendsOpen(!isTrendsOpen);
                      else if (item.label === "More")
                        setIsMoreOpen(!isMoreOpen);
                    }}
                  >
                    {item.label}
                    <ChevronDownIcon
                      className={cn(
                        "h-4 w-4 transition-transform",
                        ((item.label === "Buy" && isBuyOpen) ||
                          (item.label === "Rent" && isRentOpen) ||
                          (item.label === "Luxe" && isLuxeOpen) ||
                          (item.label === "Commercial" && isCommercialOpen) ||
                          (item.label === "Services" && isServicesOpen) ||
                          (item.label === "Trends" && isTrendsOpen) ||
                          (item.label === "More" && isMoreOpen)) &&
                          "rotate-180"
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={cn(
                      "bg-white shadow-2xl transition-all duration-300 z-50 top-full",
                      // Compact dropdown only for Services
                      item.label === "Services"
                        ? "absolute right-0 w-64 py-4 rounded-xl mt-2"
                        : "fixed left-0 right-0 w-screen py-12",
                      (item.label === "Buy" && isBuyOpen) ||
                        (item.label === "Rent" && isRentOpen) ||
                        (item.label === "Luxe" && isLuxeOpen) ||
                        (item.label === "Commercial" && isCommercialOpen) ||
                        (item.label === "Services" && isServicesOpen) ||
                        (item.label === "Trends" && isTrendsOpen) ||
                        (item.label === "More" && isMoreOpen)
                        ? "opacity-100 scale-100 translate-y-0 visible"
                        : "opacity-0 scale-95 -translate-y-2 invisible"
                    )}
                  >
                    <div
                      className={cn(
                        item.label === "Services"
                          ? "px-4"
                          : "container-custom mx-auto grid grid-cols-12 gap-12"
                      )}
                    >
                      {/* Compact dropdown only for Services */}
                      {item.label === "Services" ? (
                        <div className="space-y-1">
                          {item.items?.map((navItem) => (
                            <Link
                              key={navItem.label}
                              href={navItem.href}
                              className="block px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                              onClick={() => {
                                setIsServicesOpen(false);
                              }}
                            >
                              {navItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        // Full mega menu for Buy, Rent, Luxe, Commercial
                        item.items?.map((navItem, index) => {
                          const isAreaList = navItem.label === "Popular Areas";

                          return (
                            <div
                              key={navItem.label}
                              className={cn(
                                isAreaList ? "col-span-6" : 
                                item.label === "More" ? "col-span-4" :
                                "col-span-3"
                              )}
                            >
                              <Link
                                href={navItem.href}
                                className="block text-lg font-bold text-secondary hover:text-primary transition-all border-b border-slate-100 pb-3 mb-6"
                                onClick={() => {
                                  if (item.label === "Buy") setIsBuyOpen(false);
                                  else if (item.label === "Rent")
                                    setIsRentOpen(false);
                                  else if (item.label === "Luxe")
                                    setIsLuxeOpen(false);
                                  else if (item.label === "Commercial")
                                    setIsCommercialOpen(false);
                                  else if (item.label === "More")
                                    setIsMoreOpen(false);
                                }}
                              >
                                {navItem.label}
                              </Link>
                              {navItem.subItems && (
                                <div
                                  className={cn(
                                    isAreaList
                                      ? "grid grid-cols-3 gap-x-6 gap-y-4"
                                      : "space-y-3"
                                  )}
                                >
                                  {navItem.subItems.map((subItem, subIndex) => {
                                    const areaInfo = dubaiAreas.find(
                                      (a) => a.name === subItem.label
                                    );
                                    return (
                                      <Link
                                        key={subItem.label}
                                        href={subItem.href}
                                        className="group flex items-center gap-3 transition-all p-1 rounded-xl hover:bg-slate-50"
                                        onClick={() => {
                                          if (item.label === "Buy")
                                            setIsBuyOpen(false);
                                          else if (item.label === "Rent")
                                            setIsRentOpen(false);
                                          else if (item.label === "Luxe")
                                            setIsLuxeOpen(false);
                                          else if (item.label === "Commercial")
                                            setIsCommercialOpen(false);
                                          else if (item.label === "More")
                                            setIsMoreOpen(false);
                                        }}
                                      >
                                        {areaInfo && isAreaList && (
                                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                            <img
                                              src={areaInfo.image}
                                              alt={subItem.label}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                          </div>
                                        )}
                                        <span
                                          className={cn(
                                            isAreaList
                                              ? "text-xs font-bold text-secondary group-hover:text-primary leading-tight"
                                              : "text-sm text-slate-600 hover:text-primary font-medium"
                                          )}
                                        >
                                          {subItem.label}
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : item.isValuation ? (
                <button
                  onClick={() => setIsValuationModalOpen(true)}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all hover:text-primary hover:bg-slate-50 relative group text-secondary"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all hover:text-primary hover:bg-slate-50 relative group text-secondary"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          <button
            onClick={() => setIsValuationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all bg-primary text-white hover:bg-primary/90 hover:shadow-lg shadow-md active:scale-95"
            title="Get property valuation"
          >
            <CalculatorIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Valuation</span>
          </button>

          {/* User Profile or Sign In */}
          {user && profile ? (
            // Profile Dropdown
            <div className="relative" data-profile-dropdown>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold text-xs transition-all bg-secondary text-white hover:bg-primary group"
                title={profile.full_name || profile.email}
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-[11px]">{profile.full_name?.split(' ')[0] || 'Profile'}</span>
                <ChevronDownIcon className={cn(
                  "h-4 w-4 transition-transform",
                  isProfileDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-secondary">{profile.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                  <nav className="py-2">
                    <Link
                      href={
                        profile.role == 'admin'
                          ? '/admin/dashboard'
                          : profile.role === 'agent'
                          ? '/agent/dashboard'
                          : '/customer/dashboard'
                      }
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <UserIcon className="h-4 w-4" />
                      View Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            // Sign In Button
            <Link
              href="/customer/login"
              className="h-10 w-10 rounded-full font-bold text-sm transition-all bg-primary text-white hover:bg-secondary hover:scale-110 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors text-secondary hover:bg-slate-50"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
     {isMobileMenuOpen && (
  <div className="lg:hidden fixed left-0 right-0 top-full bg-white z-[99] shadow-2xl animate-slideDown">
    <div className="max-h-[calc(100vh-88px)] overflow-y-auto">
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
                  {t("header.navigation.newProjects")}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-white -rotate-90" />
              </Link>

              {/* Buy Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t("header.navigation.buy")}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Property Types
                  </div>
                  <Link
                    href="/properties?action=buy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    All Properties
                  </Link>
                  <Link
                    href="/properties?action=buy&type=apartment"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Apartments
                  </Link>
                  <Link
                    href="/properties?action=buy&type=villa"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Villas
                  </Link>
                  <Link
                    href="/properties?action=buy&type=townhouse"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Townhouses
                  </Link>
                  <Link
                    href="/properties?action=buy&type=penthouse"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Penthouses
                  </Link>
                  <Link
                    href="/properties?action=buy&type=studio"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Studios
                  </Link>
                  <Link
                    href="/properties?action=buy&feature=landmark"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Landmarks
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Popular Areas
                  </div>
                  {dubaiAreas.slice(0, 8).map((area) => (
                    <Link
                      key={area.name}
                      href={`/properties?action=buy&area=${area.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
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
                  {t("header.navigation.rent")}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Property Types
                  </div>
                  <Link
                    href="/properties?action=rent"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    All Properties
                  </Link>
                  <Link
                    href="/properties?action=rent&type=apartment"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Apartments
                  </Link>
                  <Link
                    href="/properties?action=rent&type=villa"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Villas
                  </Link>
                  <Link
                    href="/properties?action=rent&type=townhouse"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Townhouses
                  </Link>
                  <Link
                    href="/properties?action=rent&type=penthouse"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Penthouses
                  </Link>
                  <Link
                    href="/properties?action=rent&type=studio"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Studios
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Popular Areas
                  </div>
                  {dubaiAreas.slice(0, 8).map((area) => (
                    <Link
                      key={area.name}
                      href={`/properties?action=rent&area=${area.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
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
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Luxury Collections
                  </div>
                  <Link
                    href="/properties?category=luxe"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    All Luxury
                  </Link>
                  <Link
                    href="/properties?category=luxe&feature=beachfront"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Beachfront
                  </Link>
                  <Link
                    href="/properties?category=luxe&feature=pool"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Private Pools
                  </Link>
                  <Link
                    href="/properties?category=luxe&feature=smart-home"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Smart Homes
                  </Link>
                  <Link
                    href="/properties?category=luxe&feature=golf"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Golf Communities
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Premium Areas
                  </div>
                  <Link
                    href="/properties?category=luxe&area=dubai-marina"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Dubai Marina
                  </Link>
                  <Link
                    href="/properties?category=luxe&area=palm-jumeirah"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Palm Jumeirah
                  </Link>
                  <Link
                    href="/properties?category=luxe&area=downtown-dubai"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Downtown Dubai
                  </Link>
                  <Link
                    href="/properties?category=luxe&area=emirates-hills"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Emirates Hills
                  </Link>
                </div>
              </div>

              {/* Commercial Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t("header.navigation.commercial")}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Commercial Types
                  </div>
                  <Link
                    href="/properties?action=buy&type=commercial"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    All Commercial
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&subtype=office"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Office Spaces
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&subtype=retail"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Retail Shops
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&subtype=warehouse"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Warehouses
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&subtype=coworking"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Co-working
                  </Link>

                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Business Districts
                  </div>
                  <Link
                    href="/properties?action=buy&type=commercial&area=business-bay"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Business Bay
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&area=difc"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    DIFC
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&area=dubai-silicon-oasis"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Dubai Silicon Oasis
                  </Link>
                  <Link
                    href="/properties?action=buy&type=commercial&area=deira"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Deira
                  </Link>
                </div>
              </div>

              {/* Services Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t("header.navigation.services")}
                </div>
                <div className="space-y-2">
                  <Link
                    href="/services/property-management"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span className="text-base font-bold text-secondary">
                      {t("header.navigation.propertyManagement")}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 -rotate-90" />
                  </Link>
                  <Link
                    href="/services/consultation"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span className="text-base font-bold text-secondary">
                      {t("header.navigation.consultation")}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 -rotate-90" />
                  </Link>
                  <Link
                    href="/services/investment"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span className="text-base font-bold text-secondary">
                      {t("header.navigation.investment")}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400 -rotate-90" />
                  </Link>
                </div>
              </div>

              {/* More Section */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                  {t("header.navigation.more")}
                </div>
                <div className="space-y-2">
                  {/* Market Insights */}
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Market Insights
                  </div>
                  <Link
                    href="/market/investments-map"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Investments Map
                  </Link>
                  <Link
                    href="/market/projects-sales"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Projects Sales Transactions
                  </Link>
                  <Link
                    href="/market/performance-2024"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Market Performance 2024
                  </Link>
                  <Link
                    href="/market/prices-2024"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Dubai Properties Prices 2024
                  </Link>
                  <Link
                    href="/market/property-supply"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Dubai Property Supply
                  </Link>
                  <Link
                    href="/market/prices-index"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Properties Prices Index
                  </Link>
                  <Link
                    href="/market/dubai-numbers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Dubai In Numbers
                  </Link>
                  <Link
                    href="/market/best-investments"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Best Property Investments In Dubai
                  </Link>

                  {/* Resources & Information */}
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Resources & Information
                  </div>
                  <Link
                    href="/guides"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {t("header.navigation.guides")}
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {t("header.navigation.news")}
                  </Link>
                  <Link
                    href="/why-invest-dubai"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {t("header.navigation.whyInvestInDubai")}
                  </Link>
                  <Link
                    href="/faqs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    FAQs
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Blog
                  </Link>

                  {/* Company */}
                  <div className="text-xs font-bold text-slate-600 px-4 mt-3">
                    Company
                  </div>
                  <Link
                    href="/partners"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Partner
                  </Link>
                  <Link
                    href="/clients"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    Clients
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {t("header.navigation.about")}
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-6 text-sm text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {t("header.navigation.contact")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsValuationModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-primary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg"
              >
                <CalculatorIcon className="h-5 w-5" />
                {t("header.navigation.valuation")}
              </button>

              {user && profile ? (
                <>
                  <Link
                    href={
                      profile.role === 'admin'
                        ? '/admin/dashboard'
                        : profile.role === 'agent'
                        ? '/agent/dashboard'
                        : '/customer/dashboard'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 bg-secondary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all shadow-lg"
                  >
                    <UserIcon className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-600 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/customer/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-secondary text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all shadow-lg"
                >
                  <UserIcon className="h-5 w-5" />
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
        </div>
      )}

      {/* Valuation Modal */}
      <ValuationModal
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        onSubmit={handleValuationSubmit}
      />
    </header>
  );
}
