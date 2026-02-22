'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  HomeIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  UserGroupIcon,
  CogIcon,
  PlusCircleIcon,
  StarIcon,
  BeakerIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  BoltIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline'

const services = [
  {
    id: 1,
    title: "Property Sales Services",
    description: "Expertly managing off-plan sales for developers—delivered with precision.",
    icon: BuildingOffice2Icon,
    href: "/services/property-sales",
    color: "from-amber-400 to-amber-600",
    details: "At Ragdoll Properties, we specialize in managing off-plan property sales for developers—and when we say 'delivered,' we mean it. Our mission is to facilitate seamless property sales while ensuring our clients achieve maximum returns on their investments."
  },
  {
    id: 2,
    title: "Fitout Services",
    description: "Full-range specialized fit-out solutions for premium properties.",
    icon: CogIcon,
    href: "/services/fitout",
    color: "from-amber-300 to-yellow-500",
    details: "We provide a full range of specialized fit-out solutions, including aluminium and façade works, glazing, metal works, joinery, glass installations, and premium finishing."
  },
  {
    id: 3,
    title: "360 Solutions",
    description: "End-to-end real estate development services and analysis.",
    icon: Square3Stack3DIcon,
    href: "/services/360-solutions",
    color: "from-yellow-400 to-amber-500",
    details: "We provide end-to-end real estate development services, beginning with development structuring, investment analysis, ROI feasibility, and strategic market analysis."
  },
  {
    id: 4,
    title: "Property Resale Services",
    description: "Expert assistance in reselling properties at optimal prices.",
    icon: ArrowTrendingUpIcon,
    href: "/services/property-resale",
    color: "from-amber-400 to-orange-500",
    details: "Assisting clients in reselling their properties at competitive prices with expert market positioning and comprehensive marketing strategies."
  },
  {
    id: 5,
    title: "Property Management Services",
    description: "Comprehensive property management to enhance value.",
    icon: HomeIcon,
    href: "/services/property-management",
    color: "from-yellow-400 to-amber-600",
    details: "Offering full-service property management to maintain and enhance property value through proactive maintenance and professional tenant relations."
  },
  {
    id: 6,
    title: "Conveyancing Services",
    description: "Streamlined legal property transfers and transactions.",
    icon: DocumentCheckIcon,
    href: "/services/conveyancing",
    color: "from-amber-500 to-orange-600",
    details: "We streamline property sales and help investors secure Golden Visas, offering services like property valuation, gifting, registration, and company setup."
  },
  {
    id: 7,
    title: "Mortgage Advisory & Brokerage",
    description: "Expert financing solutions through premier banking partners.",
    icon: BanknotesIcon,
    href: "/services/mortgage-advisory",
    color: "from-yellow-500 to-amber-600",
    details: "Offering expert advice and brokerage services for property financing with access to competitive rates and flexible solutions."
  },
  {
    id: 8,
    title: "Real Estate Master Agency",
    description: "Master agency services for seamless transactions.",
    icon: UserGroupIcon,
    href: "/services/property-master-agency",
    color: "from-amber-400 to-yellow-600",
    details: "Acting as a master agency to streamline and manage property transactions across multiple channels and market segments."
  },
  {
    id: 9,
    title: "Real Estate Development",
    description: "Visionary architecture and design excellence.",
    icon: WrenchIcon,
    href: "/services/development",
    color: "from-amber-500 to-yellow-600",
    details: "Delivering architecture and design excellence through seamless development management, blending minimalism with luxurious aesthetics."
  },
  {
    id: 10,
    title: "Development Management",
    description: "Expert oversight from inception to handover.",
    icon: CheckCircleIcon,
    href: "/services/development-management",
    color: "from-yellow-400 to-amber-500",
    details: "Managing the entire development process from inception to handover with meticulous attention to detail and timeline compliance."
  },
  {
    id: 11,
    title: "Real Estate Private Equity",
    description: "Strategic investment in high-potential projects.",
    icon: CreditCardIcon,
    href: "/services/private-equity",
    color: "from-amber-500 to-orange-600",
    details: "Investing in high-potential real estate projects to maximize returns through strategic partnership and portfolio diversification."
  },
  {
    id: 12,
    title: "Holiday Homes Management",
    description: "Short-term rental property expertise.",
    icon: StarIcon,
    href: "/services/holiday-homes",
    color: "from-yellow-500 to-amber-600",
    details: "Managing short-term rental properties to provide exceptional guest experiences and optimize occupancy and revenue."
  },
  {
    id: 13,
    title: "RenTech",
    description: "Technology-driven renovation solutions.",
    icon: BeakerIcon,
    href: "/services/rentech",
    color: "from-amber-400 to-yellow-600",
    details: "Utilizing the latest technologies to renovate and enhance properties with innovative solutions and modern techniques."
  },
  {
    id: 14,
    title: "PropTech Solutions",
    description: "Technology for enhanced real estate operations.",
    icon: CogIcon,
    href: "/services/proptech",
    color: "from-yellow-400 to-amber-600",
    details: "Leveraging technology to improve real estate transactions and management with digital platforms and smart solutions."
  },
  {
    id: 15,
    title: "Interior Design Services",
    description: "Comprehensive architectural design services.",
    icon: SparklesIcon,
    href: "/services/interior-design",
    color: "from-amber-500 to-yellow-600",
    details: "Comprehensive design services covering architecture and interior design with specialized expertise in FF&E selection."
  },
  {
    id: 16,
    title: "Construction Project Management",
    description: "Complete project lifecycle management.",
    icon: WrenchIcon,
    href: "/services/construction-pm",
    color: "from-yellow-500 to-amber-600",
    details: "Expertise covering the full spectrum of project life-cycle management ensuring smooth progress from inception to completion."
  },
  {
    id: 17,
    title: "Snagging & Inspection",
    description: "Thorough engineered inspections.",
    icon: MagnifyingGlassIcon,
    href: "/services/snagging",
    color: "from-amber-400 to-orange-600",
    details: "Conducting thorough engineered inspections to identify and address any issues before handover."
  },
  {
    id: 18,
    title: "Property Handover",
    description: "Seamless property transition services.",
    icon: LockClosedIcon,
    href: "/services/handover",
    color: "from-yellow-400 to-amber-600",
    details: "Ensuring a smooth transition of completed properties to owners and tenants with comprehensive handover support."
  },
  {
    id: 19,
    title: "MEP Services",
    description: "Precision mechanical, electrical & plumbing.",
    icon: BoltIcon,
    href: "/services/mep",
    color: "from-amber-500 to-yellow-600",
    details: "Complete spectrum of MEP services ensuring seamless integration and optimal performance in every project."
  },
  {
    id: 20,
    title: "Golden Visa Services",
    description: "UAE Golden Visa investment guidance.",
    icon: StarIcon,
    href: "/services/golden-visa",
    color: "from-yellow-500 to-amber-600",
    details: "Secure your UAE Golden Visa through smart Dubai property investment. Our experts guide you through every step."
  },
  {
    id: 21,
    title: "Training Academy",
    description: "Professional real estate education.",
    icon: AcademicCapIcon,
    href: "/services/training-academy",
    color: "from-amber-400 to-yellow-600",
    details: "Providing comprehensive training for real estate professionals with industry expertise and certification programs."
  },
  {
    id: 22,
    title: "Rental Services",
    description: "Optimized property rental management.",
    icon: HomeIcon,
    href: "/services/rental-services",
    color: "from-yellow-400 to-amber-600",
    details: "Managing rental properties to optimize rental yields and occupancy rates with professional tenant management."
  },
  {
    id: 23,
    title: "Construction Services",
    description: "Comprehensive base-build development.",
    icon: BuildingOffice2Icon,
    href: "/services/construction",
    color: "from-amber-500 to-orange-600",
    details: "Complete construction capabilities spanning enabling works through specialized features like swimming pools and landscaping."
  }
]


export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Golden gradient background */}
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-amber-900/20 via-transparent to-amber-800/10 -z-10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 left-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container-custom mx-auto text-center">
          <div className="inline-block px-6 py-2 bg-linear-to-r from-amber-400 to-yellow-500 rounded-full mb-8">
            <span className="text-sm font-black text-amber-900 tracking-widest uppercase">Our Expertise</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-linear-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"> Premium Real Estate Services</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Experience excellence with Ragdoll Properties' comprehensive suite of real estate solutions
          </p>
        </div>
      </div>

      {/* Services Grid - Premium Layout */}
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Link key={service.id} href={service.href}>
                <div className="group relative h-full bg-linear-to-br from-slate-800 to-slate-900 border border-amber-500/20 rounded-3xl p-8 hover:border-amber-400/50 transition-all duration-500 cursor-pointer overflow-hidden">
                  {/* Golden gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`}></div>
                  
                  {/* Golden accent bar */}
                  <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-linear-to-r from-amber-400 to-yellow-500 transition-all duration-500"></div>
                  
                  {/* Icon Container */}
                  <div className={`w-16 h-16 bg-linear-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                    {service.description}
                  </p>
                  
                  {/* Learn More Link */}
                  <div className="flex items-center text-amber-400 font-semibold text-sm group-hover:text-amber-300 transition-colors">
                    <span>Learn More</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Why Choose Ragdol Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-transparent to-amber-50/5">
        <div className="container-custom mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-linear-to-r from-amber-400 to-yellow-500 rounded-full mb-6">
              <span className="text-sm font-black text-amber-900 tracking-widest uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              <span className="bg-linear-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"> The Ragdoll Properties Difference</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Team",
                description: "Two decades of Dubai real estate expertise with a track record of successful projects across all segments.",
                icon: UserGroupIcon
              },
              {
                title: "Quality Assured",
                description: "Rigorous standards and meticulous attention to detail in every project and transaction.",
                icon: CheckCircleIcon
              },
              {
                title: "Premium Service",
                description: "Personalized solutions tailored to your unique needs with 24/7 support and transparency.",
                icon: StarIcon
              }
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="group bg-linear-to-br from-slate-800/50 to-slate-900/50 border border-amber-400/20 rounded-2xl p-8 hover:border-amber-400/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Premium Property Gallery Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-amber-50/5 to-transparent">
        <div className="container-custom mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-linear-to-r from-amber-400 to-yellow-500 rounded-full mb-6">
              <span className="text-sm font-black text-amber-900 tracking-widest uppercase">Featured Portfolio</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-linear-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">  Premium Property  Showcase</span>
            </h2>
            <p className="text-gray-400 text-lg">Explore our curated selection of luxury developments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { img: "/CREEK_PALACE_DCH_EMAAR_1.jpg", title: "Waterfront Luxury", desc: "Premium creek-side living" },
              { img: "/CREEK_PALACE_DCH_EMAAR_3.jpg", title: "Modern Architecture", desc: "Contemporary excellence" },
              { img: "/CREEK_PALACE_DCH_EMAAR_6.jpg", title: "Urban Living", desc: "Mixed-use development" },
              { img: "/CREEK_PALACE_DCH_EMAAR_9.jpg", title: "Interior Design", desc: "Premium finishes" },
              { img: "/CREEK_PALACE_DCH_EMAAR_12.jpg", title: "Modern Interiors", desc: "Design innovation" },
              { img: "/CREEK_PALACE_DCH_EMAAR_15.jpg", title: "Investment Grade", desc: "High-value returns" }
            ].map((project, idx) => (
              <div key={idx} className="group relative h-72 rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-125 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/95 via-slate-900/40 to-transparent group-hover:from-slate-900/98 transition-all duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-amber-300 font-semibold text-sm">{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container-custom mx-auto">
          <div className="relative overflow-hidden rounded-4xl p-12 md:p-20 bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 border border-amber-500/30">
            {/* Golden glow effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to Experience <span className="bg-linear-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Excellence?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Connect with our specialist team today for a confidential consultation about your property needs.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 group"
              >
                Schedule Consultation
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


