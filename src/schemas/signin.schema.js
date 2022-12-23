import Joi from "joi"

export const singInSchema = Joi.object({
    "email":Joi.string().email().required(),
    "password":Joi.string().required()
})