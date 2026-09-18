import { Building2, Utensils, GraduationCap, HeartPulse, ShoppingBag, Rocket, type LucideIcon } from 'lucide-react'

export type SectorKey = 'hotels' | 'restaurants' | 'schools' | 'healthcare' | 'business' | 'startups'

export const sectors: { key: SectorKey; icon: LucideIcon }[] = [
  { key: 'hotels', icon: Building2 },
  { key: 'restaurants', icon: Utensils },
  { key: 'schools', icon: GraduationCap },
  { key: 'healthcare', icon: HeartPulse },
  { key: 'business', icon: ShoppingBag },
  { key: 'startups', icon: Rocket },
]
