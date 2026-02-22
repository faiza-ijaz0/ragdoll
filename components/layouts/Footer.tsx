'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  const footerLinks = {
    company: [
      { label: t('footer.aboutUs'), href: '/about' },
      { label: t('footer.careers'), href: '/careers' },
      { label: t('footer.contact'), href: '/contact' },
      { label: t('footer.services'), href: '/services' },
    ],
    discover: [
      { label: t('footer.buyProperty'), href: '/properties?status=sale' },
      { label: t('footer.newProjects'), href: '/projects' },
      { label: t('footer.eliteAgents'), href: '/agents' },
      { label: t('footer.marketInsights'), href: '/market' },
    ],
    legal: [
      { label: t('footer.termsOfService'), href: '/terms' },
      { label: t('footer.privacyPolicy'), href: '/privacy' },
      { label: t('footer.cookiePolicy'), href: '/cookies' },
      { label: t('footer.faq'), href: '/faq' },
    ],
  }

  // Social media links array banayi hai
  const socialLinks = [
    { 
      id: 'fb', 
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1WMtVaGaxY/',
      icon: 'fb'
    },
    { 
      id: 'ig', 
      name: 'Instagram',
      url: 'https://www.instagram.com/ragdollproperties/',
      icon: 'ig'
    },
   
  ]

  return (
    <footer className="bg-secondary text-slate-300 pt-24 pb-12 border-t border-white/5">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5">
           
            <Link href="/" className=" ">
      <img 
        src="/ragdol.png" 
        alt="Ragdol Logo" 
        className="h-15 mb-15 -mt-10 rounded-2xl group-hover:opacity-90 transition-opacity"
      />
     
             
            </Link>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
              Redefining luxury real estate in Dubai. We provide bespoke property solutions for the world's most discerning investors.
            </p>
            
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">{t('footer.subscribeToEliteList')}</h4>
              <form className="flex gap-2 max-w-md">
                <input 
                  type="email" 
                  placeholder={t('footer.emailAddress')} 
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-white"
                />
               

               <Link href="/contact">
  <button className="px-6 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-white transition-all">
    <ArrowRightIcon className="h-5 w-5" />
  </button>
</Link>
              </form>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">{t('footer.company')}</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-px bg-primary transition-all group-hover:w-4"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">{t('footer.discover')}</h4>
            <ul className="space-y-4">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-px bg-primary transition-all group-hover:w-4"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section - YEH SECTION UPDATE KI HAI */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">{t('footer.contact')}</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPinIcon className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm leading-relaxed">Level 42, Emirates Towers, Sheikh Zayed Road, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-4">
                <PhoneIcon className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-4">
                <EnvelopeIcon className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm">concierge@ragdol.com</span>
              </li>
              
 {/* EXTRA LARGE SOCIAL ICONS */}
<li className="pt-6">
  <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Follow Us</h5>
  <div className="flex gap-5">
    {socialLinks.map((social) => (
      <a 
        key={social.id}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300 cursor-pointer hover:scale-110 hover:border-primary hover:shadow-lg hover:shadow-primary/30"
        aria-label={`Visit our ${social.name} page`}
      >
        <span className="text-xl font-bold uppercase">{social.icon}</span>
      </a>
    ))}
  </div>
</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - YEH SECTION SE SOCIAL LINKS REMOVE KIYE HAIN */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-slate-500">
            © {currentYear} RAGDOLL PROPERTIES Premium Real Estate. All rights reserved.
          </div>
          <div className="flex gap-8">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} href={link.href} className="text-xs uppercase tracking-widest hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-6">
            {/* SOCIAL ICONS YAHAN SE REMOVE HO GAYE HAIN */}
            {/* Aap chahein to yahan bhi rakh sakte hain, ya sirf contact section mein */}
          </div>
        </div>
      </div>
    </footer>
  )
}
