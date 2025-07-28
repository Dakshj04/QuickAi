import { Image, Sparkles, Download } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const ImageStyle = ['Realistic','Ghibli style','Anime style','Cartoon style','Fantasy style','Realistic style','3D style','Portrait style']
 
  const [selectedStyle, setSelectedStyle] = useState(ImageStyle[0])
  const [input, setInput] = useState('')
  const [publish,setPublish]=useState(false)
  const [loading,setLoading]=useState(false)
  const [downloading, setDownloading] = useState(false)
  const [content,setContent]=useState('')
  const {getToken}=useAuth()

  const onSubmitHandler=async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error('Please enter a description for your image');
      return;
    }

    try {
      setLoading(true)
      const prompt=`Generate an Image of ${input} in the style ${selectedStyle}`
      
      const {data}=await axios.post('/api/ai/generate-images',
        {prompt,publish},{headers:{Authorization:`Bearer ${await getToken()}`}}
      )
      
      if (data.success) {
        setContent(data.content)
        toast.success('Image generated successfully!');
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error.response?.data?.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!content) {
      toast.error('No image to download');
      return;
    }

    try {
      setDownloading(true);
      
      // Fetch the image
      const response = await fetch(content);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp and style
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const styleForFilename = selectedStyle.toLowerCase().replace(/\s+/g, '-');
      link.download = `ai-generated-${styleForFilename}-${timestamp}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

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
              className='w-full p-2 px-3 outline-none text-sm rounded-md border text-gray-800 border-gray-300 focus:border-blue-400'
              placeholder='Describe what you want to see in your image'
              required
            />
          </div>

          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Style</p>
            <div className='flex flex-wrap gap-2'>
              {ImageStyle.map((item) => (
                <span
                  onClick={() => setSelectedStyle(item)}
                  className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${
                    selectedStyle === item
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
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
            <button 
              type="submit"
              disabled={loading || !input.trim()} 
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading ? (
                <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <Image className='w-5'/>
              )}
              Generate Image
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Image className='w-5 h-5 text-[#00AD25]'/>
            <h1 className='text-xl font-semibold text-gray-800'>Generated Image</h1>
          </div>
          
          {/* Download Button - Only show when image is generated */}
          {content && (
            <button
              onClick={downloadImage}
              disabled={downloading}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {downloading ? (
                <span className='w-3 h-3 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <Download className='w-4 h-4' />
              )}
              Download
            </button>
          )}
        </div>

        {!content ? (
          <div className='text-sm flex flex-col items-center justify-center gap-5 text-gray-400 flex-1'>
            <Image className='w-9 h-9'/>
            <p className='text-center'>Enter prompt and click "Generate Image" to get started</p>
          </div>
        ) : (
          <div className='mt-3 flex-1 flex flex-col'>
            <div className='flex-1 flex items-center justify-center'>
              <img 
                src={content} 
                alt="Generated AI image" 
                className='max-w-full max-h-full object-contain rounded-lg shadow-sm'
                onLoad={() => console.log('Generated image loaded successfully')}
                onError={(e) => {
                  console.error('Generated image failed to load:', e);
                  toast.error('Failed to load generated image');
                }}
              />
            </div>
            
            {/* Alternative download button at bottom */}
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <button
                onClick={downloadImage}
                disabled={downloading}
                className='w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {downloading ? (
                  <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>
                ) : (
                  <Download className='w-4 h-4' />
                )}
                Download Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages