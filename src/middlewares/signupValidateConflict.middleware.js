import connectingDB from "../dataBase/db.js"

export default async function signupValidateconflict (req, res, next){
    const user = req.body

    try {
        const { rows } = await connectingDB.query("SELECT * FROM users WHERE email = $1;", [user.email])
        if(rows.length > 0){
            return res.status(409).send({message: 'Este email já está cadastrado.'})
        }

        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}