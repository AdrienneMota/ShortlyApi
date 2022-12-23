import express from "express" 
import cors from "cors"
import dotenv from "dotenv"
import authRoute from "./rotes/auth.rotes.js"
import urlsRoute from "./rotes/urls.rotes.js"
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(authRoute)
app.use(urlsRoute)

const port = process.env.PORT

app.listen(port, () => console.log(`Server is running in port: ${port}`))