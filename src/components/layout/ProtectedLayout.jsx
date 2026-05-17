import React from 'react'
import { Outlet } from 'react-router-dom'
import DesktopSidebar from './DesktopSidebar'
import TopNavbar from './TopNavbar'
import MobileBottomNav from './MobileBottomNav'
import MobileAiAssistant from '../MobileAiAssistant'

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-primary/30 flex">
      {/* Seamless Sidebar */}
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Seamless Top Navbar */}
        <TopNavbar />

        <main className="flex-1 lg:pt-16 pt-16 pb-24 lg:pb-8 px-4 lg:px-12 lg:ml-72">
          <div className="max-w-7xl mx-auto py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
      <MobileAiAssistant />
    </div>
  )
}

export default ProtectedLayout
