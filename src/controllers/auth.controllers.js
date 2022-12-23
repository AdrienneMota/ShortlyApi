import connectingDB from "../dataBase/db.js"
import bcrypt from "bcrypt"
import {v4 as createToken} from "uuid"

export async function postSignup(req, res){
    const user = req.user

    try {
        const passwordcrypt = bcrypt.hashSync(user.password, 10)
        user.password = passwordcrypt

        await connectingDB.query('INSERT INTO users ("name", "email", "password") VALUES ($1, $2, $3)', [user.name, user.email, user.password])

        res.sendStatus(201)        
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function postSignin(req, res){
    const userId = parseInt(req.user)

    try {
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
}