import Joi from "joi"

const singInSchema = Joi.object({
    "email":Joi.string().email().required(),
    "password":Joi.string().required()
})

export default singInSchema