import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { FileText, House, Scissors, SquarePen, Hash, Image, Eraser, Users, LogOut } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems=[
    {to:'/ai', label:"Dashboard" , Icon:House},
    {to:'/ai/write-article', label:"Write Article" , Icon:SquarePen},
    {to:'/ai/blog-titles', label:"Blog titles" , Icon:Hash},
    {to:'/ai/generate-images', label:"Generate Images" , Icon:Image},
    {to:'/ai/remove-background', label:"Remove Background" , Icon:Eraser},
    {to:'/ai/remove-object', label:"Remove Object" , Icon:Scissors},
    {to:'/ai/review-resume', label:"Review Resume" , Icon:FileText},
    {to:'/ai/community', label:"Community" , Icon:Users},
]
const Sidebar = ({ sidebar, setSidebar }) => {
    const {user}=useUser()
    const {signout,openUserProfile}=useClerk()
    return (
        <div className={`w-60 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 flex flex-col justify-between items-center fixed max-sm:absolute top-14 z-40 ${sidebar ? 'translate-x-0':'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
         <div className='my-7 w-full'>
            <div className="flex flex-col items-center cursor-pointer" onClick={openUserProfile}>
              <img src={user.imageUrl} alt="User Avatar" className='w-11 h-11 rounded-full mx-auto'/>
              <h1 className='mt-2 text-center font-medium'>{user.fullName}</h1>
            </div>
            <div className='px-3 mt-6 text-sm text-gray-600 font-medium'>
              {navItems.map(({to,label,Icon})=>(
                <NavLink 
                  key={to} 
                  to={to} 
                  end={to==='/ai'} 
                  onClick={()=> setSidebar(false)} 
                  className={({isActive})=> `px-2 py-2 flex items-center gap-2 rounded ${isActive ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white' : 'hover:bg-gray-100'}`}
                >
                  {({isActive})=>(
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-700'}`}/>
                      <span className={isActive ? 'text-white' : 'text-gray-700'}>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
            <div className='w-full border-t  border-gray-200 p-4 px-7 flex items-center justify-between bottom-full' >
                 <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
                <img src={user.imageUrl} alt="" className='w-8 h-8 rounded-full'/>
                <div>
                    <h1 className='text-sm: font-medium'>{user.fullName}</h1> 
                    <p className='text-xs text-gray-500'>
                        <Protect plan='premium' fallback="Free">Premium</Protect> Plan
                    </p>
                </div>
                 </div>
                 <LogOut onClick={signout} className='w-4.5 text-gray-400 hover:text-gray-700 transotion cursor-pointer'/>
            </div>
        </div>
    )
}

export default Sidebar
