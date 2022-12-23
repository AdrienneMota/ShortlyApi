import {userSchema} from "../schemas/user.schema.js"

export default function signupValidateschema(req, res, next){
    const user = req.body
    
    const { error } = userSchema.validate(user, {abortEarly: false})
    if(error){
        const erros = error.details.map((detail) => detail.message)
        return res.status(422).send(erros)
    }

    if((!user.confirmPassword)){
        return res.status(422).send({message: "ConfirmPassword não pode ser vazio."})
    }
    
    req.user = user
    next()
}