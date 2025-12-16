import express from "express"

import {registerUser,loginUser} from "../controllers/userController.js"

const userRouter=express.Router();

userRouter.post("/signup",registerUser);
userRouter.post("/signin",loginUser);


export default userRouter;