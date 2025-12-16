import Thread from "../models/Thread.js";
import { getGroqApiResponse } from "../utils/groq.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"

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

// const getThreads = async (req, res) => {
//   try {
//     const threads = await Thread.find({}).sort({ updatedAt: -1 });
//     //descending order of updatedAt...most recent data on top
//     res.json(threads);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to fetch threads" });
//   }
// };


const getThreads = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const threads = await Thread.find({ userId }).sort({ updatedAt: -1 });
        return res.json(threads);
      } catch (err) {
        console.log("Invalid token in getThreads:", err);
        // fallthrough to return all threads (backwards compatible)
      }
    }

    // fallback: return all threads if no valid token was provided
    //const threads = await Thread.find({}).sort({ updatedAt: -1 });
    //res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
};

const getThreadById = async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};


const deleteThread = async (req, res) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      res.status(404).json({ error: "Thread not found" });
    }

    res.status(200).json({ success: "Thread deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
};

const createChat = async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log("Invalid token");
      }
    }

    let thread = await Thread.findOne({ threadId });

    if (!thread) {
    
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
        userId 
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getGroqApiResponse(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
};




export { getThreads, getThreadById, deleteThread, createChat };