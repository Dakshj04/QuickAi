import { Scissors, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react'

const RemoveObject = () => {
  const [input, setInput] = useState('');
  const [object, setObject] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-400 bg-gray-50'>
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white rounded-lg border border-gray-200 p-5 self-start'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold text-gray-800'>Object Removal</h1>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Upload Image</p>

            {/* Custom Upload Input */}
            <label
              htmlFor='upload'
              className='w-full flex items-center justify-between p-2 px-3 text-sm rounded-md border border-gray-300 focus-within:border-blue-400 text-gray-600 cursor-pointer bg-white'
            >
              <span>{input?.name || 'Choose an image...'}</span>
              <Upload className='w-4 h-4 text-gray-500' />
            </label>

            <input
              id='upload'
              type='file'
              accept='image/*'
              onChange={(e) => setInput(e.target.files[0])}
              className='hidden'
              required
            />
          </div>

           <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Describe object to remove</p>
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={object}
              rows={4}
              className='w-full p-2 px-3 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-400'
              placeholder='eg.,car in background, tree from the image'
              required
            />
            <p className='text-sm'>Be specific about what you want to remove</p>
          </div>

          <div>
            <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
              <Scissors className='w-5' />
              Remove Object
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start '>
        <div className='flex items-center gap-3 '>
          <Scissors className='w-5 h-5 text-[#4A7AFF] ' />
          <h1 className='text-xl font-semibold text-gray-800'>Processed Image</h1>
        </div>
        <div className='text-sm flex flex-col items-center gap-5 text-gray-400 pt-17'>
          <Scissors className='w-9 h-9 ' />
          <p>Upload an image and describe what to remove</p>
        </div>
      </div>
    </div>
  );
};

export default RemoveObject
