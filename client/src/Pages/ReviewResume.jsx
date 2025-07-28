import { Eraser, FileText, Sparkles, Upload, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input) {
      toast.error('Please upload a resume file');
      return;
    }
    
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume', input);
     
      console.log('Sending resume review request...'); // Debug log
      console.log('File details:', {
        name: input.name,
        size: input.size,
        type: input.type
      }); // Debug log
      
      // Check file size on frontend (5MB limit)
      if (input.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: { 
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Resume review response:', data); // Debug log
      
      if (data.success) {
        setContent(data.content);
        toast.success('Resume reviewed successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error reviewing resume:', error);
      
      if (error.response?.status === 404) {
        toast.error('Resume review service not available. Please contact support.');
      } else if (error.response?.status === 500) {
        toast.error('Server error occurred. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to review resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Analysis copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-400 bg-gray-50'>
      {/* Left Column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white rounded-lg border border-gray-200 p-5 self-start'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold text-gray-800'>Resume Review</h1>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1.5 text-gray-800'>Upload Resume</p>

            {/* Custom Upload Input */}
            <label
              htmlFor='upload'
              className='w-full flex items-center justify-between p-2 px-3 text-sm rounded-md border border-gray-300 focus-within:border-blue-400 text-gray-600 cursor-pointer bg-white hover:bg-gray-50 transition-colors'
            >
              <span>{input?.name || 'Choose a resume...'}</span>
              <Upload className='w-4 h-4 text-gray-500' />
            </label>

            <input
              id='upload'
              type='file'
              accept='application/pdf,.pdf'
              onChange={(e) => setInput(e.target.files[0])}
              className='hidden'
              required
            />
          </div>

          <p className='text-xs text-gray-500'>Supports PDF resume only</p>

          <div>
            <button 
              type="submit"
              disabled={loading || !input}  
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading ? (
                <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <FileText className='w-5' />
              )}
              Review Resume
            </button>
          </div>
        </div>
      </form>

      {/* Right Column */}
      <div className='w-full max-w-lg bg-white rounded-lg border border-gray-200 self-start h-[600px] flex flex-col'>
        <div className='flex items-center justify-between p-5 pb-3 flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <FileText className='w-5 h-5 text-[#00DA83]' />
            <h1 className='text-xl font-semibold text-gray-800'>Analysis Results</h1>
          </div>
          
          {/* Copy Button - Only show when content is available */}
          {content && (
            <button
              onClick={copyToClipboard}
              disabled={copied}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50'
            >
              {copied ? (
                <Check className='w-4 h-4' />
              ) : (
                <Copy className='w-4 h-4' />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 text-sm flex flex-col items-center justify-center gap-5 text-gray-400 px-5'>
            <FileText className='w-9 h-9' />
            <p className='text-center'>Upload your resume and click "Review Resume" to get started</p>
          </div>
        ) : (
          <>
            {/* Scrollable Content Area */}
            <div className='flex-1 overflow-y-auto px-5 pb-3'>
              <div className='text-sm text-slate-600'>
                <div className='reset-tw prose prose-sm max-w-none'>
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;