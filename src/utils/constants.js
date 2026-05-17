import { 
  LayoutDashboard, 
  Bot, 
  BookOpen, 
  PenTool, 
  BrainCircuit, 
  Timer, 
  Target, 
  Bell, 
  User, 
  Settings 
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
  { label: 'Notes', icon: BookOpen, path: '/notes' },
  { label: 'Quiz', icon: PenTool, path: '/quiz' },
  { label: 'Flashcards', icon: BrainCircuit, path: '/flashcards' },
  { label: 'Pomodoro', icon: Timer, path: '/pomodoro' },
  { label: 'Goals', icon: Target, path: '/goals' },
]

export const USER_NAV_ITEMS = [
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]
