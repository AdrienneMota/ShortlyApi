import connectingDB from "../dataBase/db.js";
import { nanoid } from "nanoid";

export async function posturls(req, res){
    const session = res.locals.session
    const urlUser = req.url

    try {
        const userId = session.userId
        const { url } = urlUser

        const shortUrl = nanoid(10)

        await connectingDB.query('INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);', [userId, url, shortUrl])

        res.send({shortUrl: shortUrl})
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function getUrls(req, res){
    const urlId = parseInt(req.params.id)

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
}

export async function redirectShortUrl(req, res){
    const url = res.locals.url

    try {
        const visitCount = url.visitCount + 1
        console.log(url)

        await connectingDB.query('UPDATE urls SET "visitCount" = $1 WHERE id=$2', [visitCount, url.id])

        res.redirect(url.url)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function deleteurl(req, res){
    const urlId = req.urlId

    try {
        await connectingDB.query('DELETE FROM urls WHERE id=$1;', [urlId])

        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function urlsFromUser(req, res){
    const session = res.locals.session

    try {
        const rawUser = await connectingDB.query('SELECT id, name FROM users WHERE id=$1', [session.userId])
        if(rawUser.rows.length === 0){
            return res.status(404).send({message: "Este usuário não existe."})
        }
        const rawUrls = await connectingDB.query('SELECT id, "shortUrl", url, "visitCount" FROM urls WHERE "userId"=$1', [session.userId])
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
}

export async function ranking(req, res){
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
}