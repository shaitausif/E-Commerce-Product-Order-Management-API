import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

import express from 'express'
import cors from 'cors'
import morganMiddleware from './logger/morgan.logger.js'
// we use cookie-parser to parse HTTP server cookie parsing and serialization
import cookieParser from 'cookie-parser'
const app = express()

// we use, use method of express to use middlewares and for configuration
const corsOrigin = process.env.CORS_ORIGIN?.trim()
app.use(cors({
    origin : corsOrigin,
    credentials : true
}))

// here we're configuring the express to allow json requests with a certain limit
app.use(express.json({limit: "16kb"}))

// here we're configuring the express about how to take parameters as request from the user it should be encoded
app.use(express.urlencoded({extended : true, limit : '16kb'}))


// we use cookieParser to access the cookies from user's browser and to set those cookies

app.use(cookieParser())
app.use(morganMiddleware)


// routes imports
import userRouter from './routes/user.route.js'
import productRouter from './routes/product.route.js'
import orderRouter from './routes/order.route.js'
import cartRouter from './routes/cart.route.js'


// routes declaration
// registering middleware (in this case, the userRouter) to handle any HTTP method (GET, POST, PUT, DELETE, etc.) that starts with /api/v1/users.


app.use('/api/v1/user',userRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/cart', cartRouter)


export {app}