import connectingDB from "../dataBase/db.js"

export default async function shortUrlValidate (req, res, next){
    const shortUrl = req.params.shortUrl

    try {
        const url = await connectingDB.query('SELECT * FROM urls WHERE "shortUrl" = $1;', [shortUrl])
    
        if(url.rows.length === 0){
            return res.status(404).send({message: "ShortUrl inexistente."})
        }
        res.locals.url = url.rows[0]
        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}