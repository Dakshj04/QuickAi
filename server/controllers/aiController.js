import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/express';
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticles = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const { prompt, length } = req.body;
        const free_usage = req.free_usage;
    
        if (plan !== 'premium' && free_usage >= 10) { // Changed > to >= for clearer limit
            return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
        }  
        
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: length,
        });

        const content = response.choices[0].message.content;

        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            // Get current user data to preserve existing metadata
            const user = await clerkClient.users.getUser(userId);
            
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user.privateMetadata, // Preserve existing metadata
                    free_usage: free_usage + 1  
                }
            });
        }   
        
        res.json({ success: true, content })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const { prompt } = req.body;
        const free_usage = req.free_usage;
    
        if (plan !== 'premium' && free_usage >= 10) { // Changed > to >= for clearer limit
            return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
        }  
        
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            // Get current user data to preserve existing metadata
            const user = await clerkClient.users.getUser(userId);
            
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user.privateMetadata, // Preserve existing metadata
                    free_usage: free_usage + 1  
                }
            });
        }   
        
        res.json({ success: true, content })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const { prompt, publish } = req.body;
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
         
        const formData = new FormData()
        formData.append('prompt', prompt)
        
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString("base64")}`;

        const {secure_url} = await cloudinary.uploader.upload(base64Image);

        // FIX: Use secure_url instead of content
        await sql`insert into creations (user_id, prompt, content, type, publish) values (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const removeImageBackground = async (req, res) => { 
  try {
    const { userId } = req.auth();
    const plan = req.plan;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image file is missing" });
    }

    if (plan !== 'premium') {
      return res.json({ success: false, message: "This feature is only available on premium subscriptions" });
    }

    const dataUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(dataUri, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.error('Controller error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    console.log('=== removeImageObject called ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    const { userId } = req.auth();
    const plan = req.plan;
    const image = req.file;
    const { object } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "No image file received" });
    }

    if (!object) {
      return res.status(400).json({ success: false, message: "Please specify an object to remove" });
    }

    if (plan !== 'premium') {
      return res.status(403).json({ success: false, message: "This feature is only available on premium subscriptions" });
    }

    const dataUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'object-removal',
        resource_type: 'image'
      });
      console.log('Cloudinary upload result:', uploadResult);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ success: false, message: "Failed to upload image to cloud storage" });
    }

    const { public_id } = uploadResult;

    const cleanObject = object
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();

    const imageUrl = cloudinary.url(public_id, {
      transformation: [
        { effect: `gen_remove:prompt_${cleanObject}` }
      ],
      resource_type: 'image',
      secure: true
    });

    try {
      await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')`;
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error('Controller error:', error.message);
    res.status(500).json({ success: false, message: "Internal server error occurred" });
  }
};

export const resumeReview = async (req, res) => {
    try {
        console.log('=== resumeReview called ===');
        console.log('req.file:', req.file);
        
        const { userId } = req.auth();
        const plan = req.plan;
        const resume = req.file;
        
        if (!resume) {
            console.log('ERROR: No resume file received');
            return res.json({ success: false, message: "No resume file received" });
        }
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
        
        console.log('File details:', {
            originalname: resume.originalname,
            size: resume.size,
            mimetype: resume.mimetype
        });

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size 5 MB" });
        }
      
        console.log('Reading PDF file...');
        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);
        
        console.log('PDF text extracted, length:', pdfData.text.length);
      
        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas of improvement. Resume Content:\n\n${pdfData.text}`;
  
        console.log('Sending to AI...');
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        console.log('AI response received, length:', content.length);

        // Save to database
        console.log('Saving to database...');
        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, 'Review the Uploaded Resume', ${content}, 'resume-review')`;
        console.log('Successfully saved to database');

        res.json({ success: true, content: content });
        
    } catch (error) {
        console.error('Controller error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}