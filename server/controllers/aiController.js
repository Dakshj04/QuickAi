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
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
         
        

        const {secure_url} = await cloudinary.uploader.upload(image.path,{
            transformation: [
                {
                    effect:'background_removal',
                    background_removal:'remove_the_background'
                }
            ]
        });

        // FIX: Use secure_url instead of content
        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const image  = req.file;
        const {object}=req.body;
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
         
        

        const {public_id} = await cloudinary.uploader.upload(image.path)
   

      const imageUrl=cloudinary.url(public_id,{
            transformation: [{effect:`gen_remove:${object}`}],
            resource_type:'image'
        })
        // FIX: Use secure_url instead of content
        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, ${`Remove ${object} from image `}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
     
        const resume=req.file;
        
        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available on premium subscriptions"});
        }  
         
        

       if (resume.size>5*1024*1024) {
        return res.json({success:false,message:"Resume file size exceeds allowed size 5 MB"})
       }
      
       const dataBuffer=fs.readFileSync(resume.path)
       const pdfData= await pdf(dataBuffer)
      
       const prompt=`Review the following resume and provide constructive feedback on its strengths,weaknesses,and areas of improvement. Resume Content:\n\n${pdfData.text} `
  
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

        const content = response.choices[0].message.content


        // FIX: Use secure_url instead of content
        await sql`insert into creations (user_id, prompt, content, type) values (${userId}, 'Review the Uploaded Resume', ${content}, 'resume-review')`;

        res.json({ success: true, content: content })
    } catch (error) {
        console.log('Controller error:', error.message);
        res.json({ success: false, message: error.message }) 
    }
}