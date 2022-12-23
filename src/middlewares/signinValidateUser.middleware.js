import connectingDB from "../dataBase/db.js"
import bcrypt from "bcrypt"

export default async function signinValidateuser (req, res, next){
    const user = req.user

    try {
        const userExist = await connectingDB.query("SELECT * FROM users WHERE email = $1;", [user.email])
        if((userExist.rows.length === 0) || !bcrypt.compareSync(user.password, userExist.rows[0].password)){
            return res.status(401).send({message: 'Usuário ou senha incorreto.'})
        }
        
        req.user = userExist.rows[0].id
        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
} 