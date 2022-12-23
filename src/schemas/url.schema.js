import Joi from "joi";

const urlSchema = Joi.object({
    "url": Joi.string().trim(true).required()
})

export default urlSchema