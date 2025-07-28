import { useAuth } from '@clerk/clerk-react';
import { Hash,Sparkles } from 'lucide-react'
import {React,useState} from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = ['General','Technology','Business','Health','Lifestyle','Education','Travel','Food']
 
  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
  const [input, setInput] = useState('')
  const [loading,setLoading]=useState(false)
  const [content,setContent]=useState('')
  const {getToken}=useAuth()


  const onSubmitHandler=async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt=`Generate a blog title for the keyword ${input} in the category ${selectedCategory}`
      const {data}=await axios.post('/api/ai/generate-blog-title',
        {prompt},{headers:{Authorization:`Bearer ${await getToken()}`}}
      )
      if (data.success) {
        setContent(data.content)
        toast.success('Blog titles generated successfully!');
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-400 bg-gray-50'>
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white rounded-lg border border-gray-200 p-5 self-start'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold text-gray-800'>AI Title Generator</h1>
        </div> 
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Keyword</p>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type='text'
              className='w-full p-2 px-3 outline-none text-sm rounded-md border text-gray-800 border-gray-300 focus:border-blue-400'
              placeholder='The future of Artificial Intelligence is...'
              required
            />
          </div>

        
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Category</p>
            <div className='flex flex-wrap gap-2'>
              {blogCategories.map((item) => (
                <span
                  onClick={() => setSelectedCategory(item)}
                  className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${
                    selectedCategory === item
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
        
          <div>
            <button disabled={loading||!input.trim()} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'>
              {
                loading? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                : <Hash className='w-5'/>
              }
              Generate title
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start '>
       <div className='flex items-center gap-3 '>
        <Hash className='w-5 h-5 text-[#8E37EB] '/>
        <h1 className='text-xl font-semibold text-gray-800'>Generated titles</h1>
       </div>
       {
        !content?(
        
       <div className='text-sm flex flex-col items-center gap-5 text-gray-400 pt-17'>
               <Hash className='w-9 h-9 '/>
               <p>Enter Keyword and click "Generate title " to get started</p>
       </div>

        ):(<div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                      <div className='reset-tw'>
                       <Markdown>{content}</Markdown>
                       </div>
                     </div>)
        }
      </div>
    </div>
  )
}
export default BlogTitles
