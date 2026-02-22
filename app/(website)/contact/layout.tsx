import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact RAGDOLL - Real Estate Experts in Dubai',
  description: 'Get in touch with RAGDOLL\'s real estate experts in Dubai. Contact us for property inquiries, investment advice, and professional property services.',
  keywords: 'contact RAGDOLL, real estate dubai contact, property inquiry dubai, real estate agents dubai, property consultation dubai',
  openGraph: {
    title: 'Contact RAGDOLL - Real Estate Experts in Dubai',
    description: 'Get in touch with RAGDOLL\'s real estate experts in Dubai for property inquiries and investment advice.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact RAGDOLL - Real Estate Experts in Dubai',
    description: 'Get in touch with RAGDOLL\'s real estate experts in Dubai for property inquiries.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}