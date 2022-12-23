import connectingDB from "../dataBase/db.js"

export default async function tokenValidate(req, res, next){
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

        res.locals.session = session.rows[0]
        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}