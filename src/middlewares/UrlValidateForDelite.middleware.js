import connectingDB from "../dataBase/db.js"

export default async function UrlValidateForDelete(req, res, next){
    const urlId  = parseInt(req.params.id)
    const session = res.locals.session
 
    
    try {
        const idFromsession = session.userId
        
        const url = await connectingDB.query('SELECT * FROM urls WHERE id=$1;', [urlId])
    
        if(url.rowCount === 0){
            return res.status(404).send({message: "A url encurtada não existe."})
        }

        const idFromurl = url.rows[0].userId

        if(idFromurl != idFromsession){
            return res.status(401).send({message: "A url não pertence a este usuário."})
        }

        req.urlId = urlId
        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}