// As early as possible in your application, import and configure dotenv and that's why we're doing this in the file which is going to be executed first before any other
// The below way of using require for dotenv will work but it will create an inconsistency in our code
// require('dotenv').config({path : './env'})

import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'


dotenv.config({
    path : './.env'
})

// MONGODB returns a promise when we connect to it
connectDB()
.then(() => {
    
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`Server is running at http://localhost:${process.env.PORT}`)                           
    })
})
.catch(() => {
    console.log('Mongodb Connection failed!!')
})

