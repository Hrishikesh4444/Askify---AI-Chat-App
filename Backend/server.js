import express from 'express';
import "dotenv/config";
import cors from 'cors';
import mongoose from 'mongoose';
import chatRouter from './routes/chatRoute.js';
import userRouter from './routes/userRoute.js';

const app=express();
const port=8080;

app.use(express.json());
app.use(cors());

const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
            .then(()=>{ console.log('DB connected')}); 
    } catch (error) {
        console.log(error);
    }
}

app.use("/api",chatRouter);
app.use("/api",userRouter);


app.post("/test",async(req,res)=>{
    try {
        const options={
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body:JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: req.body.message
                }]
            })
        }
        const response=await fetch("https://api.groq.com/openai/v1/chat/completions",options);
        const data=await response.json();
        
        res.send(data.choices[0].message.content);

    } catch (error) {
        console.log(error);
    }
})

app.listen(port,(req,res)=>{
    console.log(`Listening on port ${port}`);
    connectDb();
});