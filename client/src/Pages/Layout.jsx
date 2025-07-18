import React, { useState } from 'react'
import { Outlet ,useNavigate} from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../Components/Sidebar'
import { SignIn,useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate=useNavigate()
  const [sidebar,setSidebar]=useState(false)
  const {user}=useUser()

  return user?  (
    
    <div className='flex flex-col h-screen'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200 bg-white'>
        <img src={assets.logo} alt="logo" className="w-32 cursor-pointer" onClick={()=>navigate('/')}/>
        {
          sidebar ? 
            <X onClick={()=>setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'/> :
            <Menu onClick={()=>setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'/> 
        }
      </nav>
      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <main className='flex-1  ml-60 max-sm:ml-0 bg-[#F4F7FB] transition-all duration-300'>
          <Outlet />
        </main>
      </div>
    </div>
  ):(
    <div className='flex items-center justify-center  h-screen'>
      <SignIn />
    </div>  )

}

export default Layout
