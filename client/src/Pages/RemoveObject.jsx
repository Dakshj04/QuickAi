import { Scissors, Sparkles, Upload, Download } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState('');
  const [object, setObject] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input) {
      toast.error('Please upload an image');
      return;
    }
    
    if (!object.trim()) {
      toast.error('Please describe the object to remove');
      return;
    }
    
    try {
      if (object.split(' ').length > 3) {
        return toast.error('Please keep the object description concise (max 3 words)');
      }
      
      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object.trim());
     
      setLoading(true);
      
      const { data } = await axios.post('/api/ai/remove-object',
        formData, { 
          headers: { 
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'multipart/form-data' // Add this header
          } 
        }
      );
      
      if (data.success) {
        console.log('Backend response:', data); // Debug log
        console.log('Content received:', data.content); // Debug log
        console.log('Content type:', typeof data.content); // Debug log
        console.log('Is valid URL?', data.content && (data.content.startsWith('http') || data.content.startsWith('https'))); // Debug log
        setContent(data.content);
        toast.success('Object removed successfully!');
      } else {
        console.log('Backend error response:', data); // Debug log
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error removing object:', error);
      toast.error(error.response?.data?.message || 'Failed to remove object');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Generate filename with timestamp and object name
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const objectForFilename = object.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      link.download = `object-removed-${objectForFilename}-${timestamp}.png`;
      
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
          <Sparkles className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold text-gray-800'>Object Removal</h1>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Upload Image</p>

            {/* Custom Upload Input */}
            <label
              htmlFor='upload'
              className='w-full flex items-center justify-between p-2 px-3 text-sm rounded-md border border-gray-300 focus-within:border-blue-400 text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors'
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
              onChange={(e) => setObject(e.target.value)} // Fixed: was using setInput instead of setObject
              value={object}
              rows={4}
              className='w-full p-2 px-3 outline-none text-sm rounded-md border text-gray-800 border-gray-300 focus:border-blue-400'
              placeholder='e.g., car in background, tree, person, sign'
              required
            />
            <p className='text-xs text-gray-500 mt-1'>Be specific about what you want to remove (keep it concise)</p>
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading || !input || !object.trim()} 
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading ? (
                <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <Scissors className='w-5' />
              )}
              Remove Object
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Scissors className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold text-gray-800'>Processed Image</h1>
          </div>
          
          {/* Download Button - Only show when image is processed */}
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
            <Scissors className='w-9 h-9' />
            <p className='text-center'>Upload an image and describe what to remove</p>
          </div>
        ) : (
          <div className='mt-3 flex-1 flex flex-col'>
            
            <div className='flex-1 flex items-center justify-center'>
              {/* Check if content looks like an image URL */}
              {content && (content.startsWith('http') || content.startsWith('data:image')) ? (
                <img 
                  src={content} 
                  alt="Object removed image" 
                  className='max-w-full max-h-full object-contain rounded-lg shadow-sm'
                  onLoad={() => {
                    console.log('Image loaded successfully');
                    console.log('Image URL:', content);
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    console.error('Failed URL:', content);
                    toast.error('Failed to load processed image');
                  }}
                />
              ) : (
                // If content doesn't look like an image URL, display it as text
                <div className='p-4 bg-gray-50 rounded-lg max-w-full overflow-auto'>
                  <p className='text-sm text-gray-600 mb-2'>Backend returned (not an image URL):</p>
                  <pre className='text-xs text-gray-800 whitespace-pre-wrap'>{content}</pre>
                </div>
              )}
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
  );
};

export default RemoveObject;