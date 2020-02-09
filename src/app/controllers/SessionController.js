import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import User from '../models/User'
import authConfig from '../../config/auth'

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    })

    const bodyIsNotValid = !(await schema.isValid(req.body))

    if (bodyIsNotValid) {
      const validationErrors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => err.errors)

      return res.status(400).json({ errors: validationErrors })
    }
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    const userNotFound = !user

    if (userNotFound) {
      return res.status(401).json({ error: 'User not found' })
    }

    const passwordDoesNotMatch = !(await user.checkPassword(password))

    if (passwordDoesNotMatch) {
      return res.status(401).json({ error: `Password does not match` })
    }

    const { id, name } = user

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    })
  }
}

export default new SessionController()
