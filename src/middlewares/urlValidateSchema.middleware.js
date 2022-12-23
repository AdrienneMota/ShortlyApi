import urlSchema from "../schemas/url.schema.js";

export default function urlValidateschema(req, res, next){
    const url = req.body
    
    const { error } = urlSchema.validate(url, {abortEarly: false})
    if(error){
        const erros = error.details.map((detail) => detail.message)
        return res.status(422).send(erros)
    }    
    
    req.url = url
    next()
}