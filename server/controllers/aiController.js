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

// Helper function to upload buffer to Cloudinary
const uploadBufferToCloudinary = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

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
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
        
        if (!image || !image.buffer) {
            return res.status(400).json({ success: false, message: "No image file received" });
        }

        const uploadResult = await uploadBufferToCloudinary(image.buffer, {
            transformation: [
                {
                    effect:'background_removal',
                    background_removal:'remove_the_background'
                }
            ]
        });

        const { secure_url } = uploadResult;

        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const removeImageObject = async (req, res) => {
    try {
        console.log('=== removeImageObject called ===');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
        
        const { userId } = req.auth();
        const plan = req.plan;
        const image = req.file;
        const { object } = req.body;
        
        // Validate inputs
        if (!image || !image.buffer) {
            console.log('ERROR: No image file received');
            return res.status(400).json({ success: false, message: "No image file received" });
        }
        
        if (!object) {
            console.log('ERROR: No object specified');
            return res.status(400).json({ success: false, message: "Please specify an object to remove" });
        }
        
        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
        
        console.log('Uploading to cloudinary with buffer');
        
        // Upload to Cloudinary with error handling
        let uploadResult;
        try {
            uploadResult = await uploadBufferToCloudinary(image.buffer, {
                folder: 'object-removal',
                resource_type: 'image'
            });
            console.log('Cloudinary upload result:', uploadResult);
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(500).json({ success: false, message: "Failed to upload image to cloud storage" });
        }

        const { public_id } = uploadResult;
        
        // Generate transformation URL with proper syntax
        let imageUrl;
        try {
            // Clean the object name for transformation - more thorough cleaning
            const cleanObject = object
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .trim();
            
            console.log('Original object:', object);
            console.log('Clean object name:', cleanObject);
            console.log('Public ID:', public_id);
            
            // For gen_remove, the correct syntax is: e_gen_remove:prompt_<object_name>
            imageUrl = cloudinary.url(public_id, {
                transformation: [
                    { 
                        effect: `gen_remove:prompt_${cleanObject}`
                    }
                ],
                resource_type: 'image',
                secure: true
            });
            
            console.log('Generated imageUrl with prompt syntax:', imageUrl);
            
        } catch (transformError) {
            console.error('Cloudinary transformation error:', transformError);
            return res.status(500).json({ success: false, message: "Failed to process image transformation" });
        }
        
        // Save to database with error handling
        try {
            await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')`;
            console.log('Successfully saved to database');
        } catch (dbError) {
            console.error('Database error:', dbError);
            console.log('Image processed successfully but failed to save to database');
        }



        res.json({ success: true, content: imageUrl });
        
    } catch (error) {
        console.error('Controller error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ success: false, message: "Internal server error occurred" });
    }
}
export const resumeReview = async (req, res) => {
    try {
        console.log('=== resumeReview called ===');
        console.log('req.file:', req.file);
        
        const { userId } = req.auth();
        const plan = req.plan;
        const resume = req.file;
        
        if (!resume || !resume.buffer) {
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
      
        console.log('Reading PDF file from buffer...');
        const pdfData = await pdf(resume.buffer);
        
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