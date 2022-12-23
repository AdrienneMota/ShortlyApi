import { Router } from "express";
import  signupValidateschema  from "../middlewares/signupValidateSchema.middleware.js"
import signupValidateconflict from "../middlewares/signupValidateConflict.middleware.js";
import signinValidateSchema from "../middlewares/signinValidateSchema.middleware.js";
import signinValidateuser from "../middlewares/signinValidateUser.middleware.js";
import { postSignup, postSignin } from "../controllers/auth.controllers.js"

const authRoute = Router()

authRoute.post("/signup", signupValidateschema, signupValidateconflict,  postSignup)
authRoute.post("/signin", signinValidateSchema, signinValidateuser, postSignin)

export default authRoute