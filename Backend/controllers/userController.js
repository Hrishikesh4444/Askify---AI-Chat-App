import User from "../models/user.js"
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken"
import validator from "validator"
import "dotenv/config";
import Thread from "../models/Thread.js";
import { v4 as uuidv4 } from "uuid";

const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
export const createThreadForUser = async (userId) => {
  const thread = new Thread({
    threadId: uuidv4(),
    title: "New Chat",
    messages: [],
    userId
  });

  await thread.save(); 
  return thread;
};


const registerUser = async (req, res) => {

    const { name, email, password} = req.body;
    try {
        //if user already exist
        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        //validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please provide a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }
        //hashing password
        const salt = await bcrypt.genSalt(10);// 10-->enter a number between 5 to 15, higher the number more stronger
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name,
            email: email,
            password: hashPassword,
            threads: []
        });
        await newUser.save();

        const thread = await createThreadForUser(newUser._id);
        
        newUser.threads = [thread._id];
        const token=createToken(newUser._id);
        newUser.token = token;
        await newUser.save();
        res.status(httpStatus.CREATED).json({ success: true, message: "User registered.", token: token, thread,threads: [thread]});


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const threads = await Thread.find({ userId: user._id }).sort({ updatedAt: -1 });

        // create new chat every login
        const newThread = await createThreadForUser(user._id);

        user.threads = user.threads ? user.threads.concat([newThread._id]) : [newThread._id];

        const token=createToken(user._id);
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({success:true, message: " User signed in", token: token,threads, newThread})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
};


export { loginUser, registerUser };