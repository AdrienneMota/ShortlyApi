import singInSchema from "../schemas/signin.schema.js"

export default function signinValidateSchema(req, res, next){
    const userLogin = req.body

    const { error } = singInSchema.validate(userLogin, {abortEarly: false})
    if(error){
        const erros = error.details.map((detail) => detail.message)
        return res.status(422).send(erros)
    }

    req.user = userLogin
    next()
}