import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {User} from '../models/user.models.js'
import { ApiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


// This method will only register the user
const registerUser = asyncHandler(async(req, res) => {

    const {username, email, password} = req.body

    if(
        // I could do the same thing using if else if ladder but it's more convenient and readable way to do the same
        [username, email, password].some((field) => (
            field?.trim() === ""
        ))
    ){
        throw new ApiError(400, "All fields are required")
    }

    const isExistingUser = await User.findOne({
        $or : [
            {username},{email}
        ]
    })

    if(isExistingUser){
        throw new ApiError(409, "User with Email or Username already exists")
    }

    // Now if the avatar is uploaded then fill the database entry by creating an User object
    const user = await User.create({
        
        username,
        email,
        password,

    })

    // Also remove the user's refreshToken and password from the response we got from the mongodb 
    const userCreated = await User.findById(user._id).select(
        "-password"
    )
    
    if(!userCreated) throw new ApiError(500, "Unable to register the User")

    // Now return the response for successful user registration
    return res.status(201).json(
        // it will show the statuscode, data, message, and success status
        new ApiResponse(201, userCreated, "User registered successfully")
    )

})



const loginUser = asyncHandler(async(req, res) => {
    // Algorithm to login the user
    // 1. Take input of email or username and password as request
    // 2. Verify the presence of the same email or username with the same password in the database and if it exists then give access and refresh token to user
    // 3. send the tokens in the cookies

    const { identifier, password } = req.body ?? {}
    console.log("Identifier",identifier)

    if(!identifier || !password){
        throw new ApiError(400, "Credentials are required")
    }  

    const user = await User.findOne({
        $or : [
            {username : identifier},
            {email: identifier}
        ]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    // Using the custom method we've defined in the user model
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password is Incorrect")
    }

    // collect the refresh and access token from our function
    const accessToken = await user.generateAccessToken()

    // but before sending the user's information in the cookies remove the unwanted fields like password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password")

    // so to make the cookie unmodifiable from the front-end we use few options
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,
            {
                user : loggedInUser, accessToken
            },
            "User logged in Successfully"   
        )
    )


})

const logoutUser = asyncHandler(async(req, res) => {
    // The first when user clicks on logged out then clear his cookie first
    // Since this app only stores the access token in a cookie, logout is handled by clearing that cookie.
    const options = {
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User Logged out successfully"))


})





export {registerUser
    ,loginUser
    ,logoutUser
}