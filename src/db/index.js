import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        // mongoose returns an object which contains the connectionInstance
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
     
        console.log(`MongoDB connected  || DB Host: ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("MongoDb Connection Failed: " , error)
        // node.js give us access of process which is a reference of the current running process of this application
        process.exit(1)
    }
}

export default connectDB