import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        console.log(user)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken 
        await user.save({validateBeforeSave:false});
        return {accessToken:accessToken, refreshToken:refreshToken}        


    }
    catch(error){
        console.log(error);
        throw new APIError(500,"Something went worng while refreshing token and access token");
    }
}

const registerUser=asyncHandler(
    async(req,res)=>{
        const {username,email,password}=req.body;
        

        if(!username || !email || !password){
            return res.status(400).json({error:"Please provide all required fields"});
        }

        const isUserPresent=await User.findOne({
            $or:[{username:username},{email:email}]
        })

        if(isUserPresent){
            throw new APIError(409,"User Already exists");
        }

        const createdUser=await User.create({
            username,
            email,
            password
        })

        const isUserCreated=await User.findById(createdUser._id).select("-password -refreshToken");
        if(!isUserCreated) {
            throw new APIError(500,"Failed to create user");
        }
        return res.status(200).json("User Created Successfully");
    }
)

const loginUser = asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400,"Email and password is required");

    }
    const user = await User.findOne({email});
    if(!user){
        throw new APIError(401,"Invalid email or password");
    }
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if(!isPasswordMatch){
        throw new APIError(401,"Invalid email or password");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id) 
    const loggedInUser = await User.findOne(user._id).select("-password, -refreshToken");

   
    return res .status(200).cookie("accessToken", accessToken).cookie("refreshToken", refreshToken).json(
        new APIresponse(200,{user:loggedInUser, accessToken, refreshToken},
            "Logged in successfully"
        )

    )
})


export {
    registerUser,
    loginUser
}
