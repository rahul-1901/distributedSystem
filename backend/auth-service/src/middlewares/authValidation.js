import Joi from 'joi'

const IITJ_EMAIL = /^[A-Za-z0-9._%+-]+@(iitj\.ac\.in|alumni\.iitj\.ac\.in)$/i

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
            .pattern(IITJ_EMAIL)
            .messages({
                "string.pattern.base": "Only iitj emails are allowed."
            }),
        password: Joi.string().min(6).max(25).required(),
        name: Joi.string().min(3).max(30).required()
    })

    const { error } = schema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    next()
}

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
            .pattern(IITJ_EMAIL)
            .messages({
                "string.pattern.base": "Only iitj emails are allowed."
            }),
        password: Joi.string().min(6).max(25).required(),
    })

    const { error } = schema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    next()

}

export { signupValidation, loginValidation }