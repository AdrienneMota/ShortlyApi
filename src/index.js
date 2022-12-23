import express from "express"
import  pkg  from "pg"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import {v4 as createToken} from "uuid"
import cors from "cors"
import { singInSchema } from "./schemas/signin.schema.js"
import { userSchema } from "./schemas/user.schema.js"
import { urlSchema } from "./schemas/url.schema.js"
import { nanoid } from "nanoid"

dotenv.config()
const { Pool } = pkg
/////////////////////////////////////////////////////////////////////////////////////////////

const app = express()
app.use(cors())
app.use(express.json())


const connectingDB = new Pool({
    connectionString: process.env.DATABASE_URL
})
/////////////////////////////////////////////////////////////////////////////////////////////

app.get("/users", async(req, res) => {
    try {
        const produtos =  await connectingDB.query("SELECT * FROM users")
        res.send(produtos.rows)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post("/signup", async (req, res) => {
    const user = req.body

    try {
        const { error } = userSchema.validate(user, {abortEarly: false})
        if(error){
            const erros = error.details.map((detail) => detail.message)
            return res.status(422).send(erros)
        }

        if((!user.confirmPassword)){
            return res.status(422).send({message: "ConfirmPassword não pode ser vazio."})
        }

        const { rows } = await connectingDB.query("SELECT * FROM users WHERE email = $1;", [user.email])
        if(rows.length > 0){
            return res.status(409).send({message: 'Este email já está cadastrado.'})
        }

        const passwordcrypt = bcrypt.hashSync(user.password, 10)
        user.password = passwordcrypt

        await connectingDB.query('INSERT INTO users ("name", "email", "password") VALUES ($1, $2, $3)', [user.name, user.email, user.password])

        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post("/signin", async(req, res) => {
    const userLogin = req.body
    
    try {
        const { error } = singInSchema.validate(userLogin, {abortEarly: false})
        if(error){
            const erros = error.details.map((detail) => detail.message)
            return res.status(422).send(erros)
        }

        const userExist = await connectingDB.query("SELECT * FROM users WHERE email = $1;", [userLogin.email])
        if((userExist.rows.length === 0) || !bcrypt.compareSync(userLogin.password, userExist.rows[0].password)){
            return res.status(401).send({message: 'Usuário ou senha incorreto.'})
        }
        const userId = userExist.rows[0].id

        const tokenExist = await connectingDB.query(`SELECT token FROM sessions WHERE "userId" = ${userId};`)
        if(tokenExist.rows.length > 0){
            return res.send({token: tokenExist.rows[0].token})
        }

        const newToken = createToken()
        await connectingDB.query(`INSERT INTO sessions ("userId", token) VALUES ($1, $2);`, [userId, newToken])
        
        res.send({token:newToken})
        
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }    
})

/////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls/shorten", async (req, res) => {
    const urluser  = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if(!token){
        return res.sendStatus(401)
    }
    
    try {
        const session = await connectingDB.query('SELECT * FROM sessions WHERE token=$1', [token])
        if(session.rows.length === 0){
            return res.sendStatus(401)
        }
             
        const { error } = urlSchema.validate(urluser, {abortEarly: false})
        if(error){
            const erros = error.details.map((detail) => detail.message)
            return res.status(422).send(erros)
        }

        //PEGANDO O ID NO USUÁRIO

        const userId = session.rows[0].userId

        //PEGANGO AS VARIÁVEIS
        const {url} = urluser

        const shortUrl = nanoid(10)

        await connectingDB.query('INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);', [userId, url, shortUrl])

        res.send({shortUrl: shortUrl})
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.get("/urls/:id", async(req, res) => {
    const urlId = req.params.id

    try {
        const urls =  await connectingDB.query('SELECT id, "shortUrl", "url" FROM urls WHERE id = $1;', [urlId])
        if(urls.rows.length === 0){
            return res.status(404).send({message: "Url inexistente."})
        }
        
        res.send(urls.rows[0])
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.get("/urls/open/:shortUrl", async(req, res) => {
    const shortUrl = req.params.shortUrl

    try {
        const url = await connectingDB.query('SELECT * FROM urls WHERE "shortUrl" = $1;', [shortUrl])
        console.log(url)
        if(url.rows.length === 0){
            return res.status(404).send({message: "ShortUrl inexistente."})
        }
        const visitCount = url.rows[0].visitCount + 1

        await connectingDB.query('UPDATE urls SET "visitCount" = $1 WHERE id=$2', [visitCount, url.rows[0].id])

        res.redirect(url.rows[0].url)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.delete("/urls/:id", async(req, res) => {
    const urlId  = parseInt(req.params.id)
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if(!token){
        return res.sendStatus(401)
    }
    
    try {
        const session = await connectingDB.query('SELECT * FROM sessions WHERE token=$1;', [token])
        if(session.rows.length === 0){
            return res.sendStatus(401)
        }
        const idFromsession = session.rows[0].userId
        
        const url = await connectingDB.query('SELECT * FROM urls WHERE id=$1;', [urlId])
    
        if(url.rowCount === 0){
            return res.status(404).send({message: "A url encurtada não existe."})
        }

        const idFromurl = url.rows[0].userId

        if(idFromurl != idFromsession){
            return res.status(401).send({message: "A url não pertence a este usuário."})
        }

        await connectingDB.query('DELETE FROM urls WHERE id=$1;', [urlId])

        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.get("/users/me", async(req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if(!token){
        return res.sendStatus(401)
    }

    try {
        const session = await connectingDB.query('SELECT * FROM sessions WHERE token=$1;', [token])
        if(session.rows.length === 0){
            return res.sendStatus(401)
        }

        const rawUser = await connectingDB.query('SELECT id, name FROM users WHERE id=$1', [session.rows[0].userId])
        if(rawUser.rows.length === 0){
            return res.status(404).send({message: "Este usuário não existe."})
        }
        const rawUrls = await connectingDB.query('SELECT id, "shortUrl", url, "visitCount" FROM urls WHERE "userId"=$1', [session.rows[0].userId])
        const shortenedUrls = rawUrls.rows || []
        const user = {
            ...rawUser.rows[0], 
            visitCount: shortenedUrls.reduce((acc, cur) => acc + cur.visitCount, 0), 
            shortenedUrls
        }
        
        res.send(user)

    } catch (error) {
        console.log(error)
        res.sendStatus(500)   
    }
})

app.get("/ranking", async(req, res) => {
    try {
        const ranking = await connectingDB.query(`
            SELECT 
                users.id, name, COUNT(urls.id) as "linksCount", 
            SUM(COALESCE(urls."visitCount", 0)) as "visitCount" 
            FROM 
                users users 
            LEFT JOIN urls urls ON urls."userId" = users.id 
            GROUP BY 
                users.id, users.name 
            ORDER BY 
                "visitCount" DESC LIMIT 10;`
        )

        res.send(ranking.rows)
    } catch (error) {
        
    }
})

app.listen(4000, ()=> console.log("Servir is running in port: 4000"))
