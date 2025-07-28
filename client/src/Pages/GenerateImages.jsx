import { Image, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const ImageStyle = ['Realisic','Ghibli style','Anime style','Cartoon style','Fantasy style','Realistic style','3D style','Portrait style']
 
  const [selectedStyle, setSelectedStyle] = useState(ImageStyle[0])
  const [input, setInput] = useState('')
  const [publish,setPublish]=useState(false)

  const onSubmitHandler=async (e) => {
    e.preventDefault();
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-400 bg-gray-50'>
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white rounded-lg border border-gray-200 p-5 self-start'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles className='w-5 h-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold text-gray-800'>AI Image Generator</h1>
        </div> 
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Describe Your Image</p>
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              rows={4}
              className='w-full p-2 px-3 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-400'
              placeholder='Describe what you want to see in your image'
              required
            />
          </div>

        
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Style</p>
            <div className='flex flex-wrap gap-2'>
              {ImageStyle.map((item) => (
                <span
                  onClick={() => setSelectedStyle(item)}
                  className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${
                    selectedStyle=== item
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className='my-6 flex items-center gap-2'>
             <label className='relative cursor-pointer'>
              <input type="checkbox" onChange={(e)=>setPublish(e.target.checked)}
               checked={publish} className='sr-only peer'/>
               <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
               <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'>
               </span>
             </label>
             <p className='text-sm'>Make this image public</p>
            </div>
        
          <div>
            <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
              <Image className='w-5'/>
              Generate title
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start '>
       <div className='flex items-center gap-3 '>
        <Image className='w-5 h-5 text-[#00AD25] '/>
        <h1 className='text-xl font-semibold text-gray-800'>Generated titles</h1>
       </div>
       <div className='text-sm flex flex-col items-center gap-5 text-gray-400 pt-17'>
               <Image className='w-9 h-9 '/>
               <p>Enter Keyword and click "Generate title " to get started</p>
       </div>
      </div>
    </div>
  )
}
export default GenerateImages
