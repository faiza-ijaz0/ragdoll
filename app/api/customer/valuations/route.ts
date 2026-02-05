import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { mockValuations } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  try {
    // Try to fetch from Firestore
    const valuationsRef = collection(db, 'valuations')
    const snapshot = await getDocs(valuationsRef)
    const valuations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({
      valuations: valuations.length > 0 ? valuations : mockValuations,
      total: valuations.length || mockValuations.length,
      source: valuations.length > 0 ? 'firestore' : 'mock'
    })
  } catch (error) {
    console.error('Error fetching valuations:', error)
    // Fallback to mock data
    return NextResponse.json({
      valuations: mockValuations,
      total: mockValuations.length,
      source: 'mock'
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    const { full_name, email, phone, message, user_id, type } = body

    if (!full_name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, phone' },
        { status: 400 }
      )
    }

    // Prepare data for Firestore
    const valuationData = {
      type: type || 'valuation_request',
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message?.trim() || '',
      status: 'pending',
      user_id: user_id || null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      read: false,
      assigned_to: null
    }

    // Save to Firestore
    const valuationsRef = collection(db, 'valuations')
    const docRef = await addDoc(valuationsRef, valuationData)

    console.log('Valuation saved to Firestore with ID:', docRef.id)

    // Also save to request_information collection for backward compatibility
    try {
      const requestInfoRef = collection(db, 'request_information')
      await addDoc(requestInfoRef, valuationData)
    } catch (error) {
      console.warn('Could not save to request_information collection:', error)
    }

    return NextResponse.json({
      id: docRef.id,
      ...valuationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message: 'Valuation request submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving valuation:', error)
    return NextResponse.json(
      { error: 'Failed to submit valuation request. Please try again.' },
      { status: 500 }
    )
  }
}