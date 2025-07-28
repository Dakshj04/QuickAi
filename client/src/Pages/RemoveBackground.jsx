import { Eraser, Sparkles, Upload, Download } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [downloading, setDownloading] = useState(false);
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', input);
     
      const { data } = await axios.post('/api/ai/remove-background',
        formData, { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      
      if (data.success) {
        setContent(data.content);
        toast.success('Background removed successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error(error.response?.data?.message || 'Failed to remove background');
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
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `background-removed-${timestamp}.png`;
      
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
          <Sparkles className='w-5 h-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold text-gray-800'>Background Removal</h1>
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

          <p className='text-xs text-gray-500'>Supports JPG, PNG, and other image formats</p>

          <div>
            <button 
              type="submit"
              disabled={loading || !input} 
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading ? (
                <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <Eraser className='w-5' />
              )} 
              Remove Background
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 self-start'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Eraser className='w-5 h-5 text-[#FF4938]' />
            <h1 className='text-xl font-semibold text-gray-800'>Processed Image</h1>
          </div>
          
     
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
            <Eraser className='w-9 h-9' />
            <p className='text-center'>Upload an image and click "Remove Background" to get started</p>
          </div>
        ) : (
          <div className='mt-3 flex-1 flex flex-col'>
            <div className='flex-1 flex items-center justify-center'>
              <img 
                src={content} 
                alt="Background removed image" 
                className='max-w-full max-h-full object-contain rounded-lg shadow-sm'
                onLoad={() => console.log('Processed image loaded successfully')}
                onError={(e) => {
                  console.error('Processed image failed to load:', e);
                  toast.error('Failed to load processed image');
                }}
              />
            </div>
            
          
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

export default RemoveBackground;