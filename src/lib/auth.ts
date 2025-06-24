import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Profile, UserRole } from '@/types/custom.types'

export interface AuthUser {
  id: string
  email: string
  profile: Profile
}

// Get current user with profile (server-side)
export async function getServerUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      console.error('Error getting profile:', profileError)
      return null
    }
    
    return {
      id: user.id,
      email: user.email || '',
      profile
    }
  } catch (error) {
    console.error('Error in getServerUser:', error)
    return null
  }
}

// Require authentication - redirect if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

// Require admin role - redirect if not admin
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.profile.role !== 'admin') {
    redirect('/unauthorized')
  }
  
  return user
}

// Check if user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getServerUser()
  return user?.profile.role === role || false
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin')
}

// Check if user is student
export async function isStudent(): Promise<boolean> {
  return await hasRole('student')
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser()
  return user !== null
}

// Get current user profile only
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getServerUser()
  return user?.profile || null
}

// Get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getServerUser()
  return user?.id || null
}

