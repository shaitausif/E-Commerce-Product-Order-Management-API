import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema( {
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        // The index will make the database tasks a bit expensive but as we are gonna use the username alot in our app for searching so it's a good idea to put index : true
        index : true
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : [true, "Password is required"]
    },
    role : {
        type : String,
        default : "user",
        enum : ["user", "admin"]
    }
},
{timestamps : true}
)


// Don't use arrow functions here — we need `function` to access the correct `this` (bound to the Mongoose document)


userSchema.pre("save",async function(next){
    // Only hash the password if it's created for first time or only the password field has been changed
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
//  Pass the control to the next middleware
    // next()
    
})

// here, i will define custom methods using the methods object of mongoose's schemas
// It will also has access to this document before saving or after saving it into the database
// I would have no access to this model fields if i had created a normal functions
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
    // It will return true or false
}


// Here both the tokens are doing the same work but the refresh token will contain less information compared to access token and will have longer expiry date to keep the users logged in
userSchema.methods.generateAccessToken = function(){
    // these methods have the access of all the fields in the database and we can access them using this keyword
    return jwt.sign(
        {
            // this object contains the payload
            _id : this._id,
            email : this.email,
            username : this.username,
            role : this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        // the below object contains the expiry information of this token
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.models.User || mongoose.model("User",userSchema)