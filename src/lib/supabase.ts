import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface PipelineStage {
  id: string
  name: string
  color: string
  bg_color: string
  position: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  stage_id?: string
  value: number
  last_contact: string
  source?: string
  created_at: string
  updated_at: string
}