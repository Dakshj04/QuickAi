import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

const WriteArticles = () => {
  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1200-1600 words)' }
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')

  const onSubmitHandler=async (e) => {
    e.preventDefault();
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-400 bg-gray-50'>
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white rounded-lg border border-gray-200 p-5 self-start'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold text-gray-800'>AI Article Writer</h1>
        </div>

        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Article Topic</p>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type='text'
              className='w-full p-2 px-3 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-400'
              placeholder='The future of Artificial Intelligence is...'
              required
            />
          </div>

        
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Article Length</p>
            <div className='flex flex-wrap gap-2'>
              {articleLength.map((item, index) => (
                <span
                  onClick={() => setSelectedLength(item)}
                  className={`text-xs px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${
                    selectedLength.text === item.text
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                  key={index}
                >
                  {item.text}
                </span>
              ))}
            </div>
        
          <div>
            <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
              <Edit />
              Generate Article 
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] self-start '>
        
       <div className='flex items-center gap-3'>
        <Edit className='w-5 h-5 text-[#4A7AFF] '/>
        <h1 className='text-xl font-semibold text-gray-800'>Generated Article</h1>
       </div>
       <div className='text-sm flex flex-col items-center gap-5 text-gray-400 pt-17'>
               <Edit className='w-9 h-9 '/>
               <p>Enter a topic and click "Generate Article" to get started</p>
       </div>
      </div>
    </div>
  )
}

export default WriteArticles
