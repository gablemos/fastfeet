import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import authConfig from '../../config/auth'

export default async (req, res, next) => {
  const authHeader = req.headers.authorization

  const tokenNotProvided = !authHeader

  if (tokenNotProvided) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  const [, token] = authHeader.split(' ')

  await promisify(jwt.verify)(token, authConfig.secret)
    .then(decoded => {
      req.userId = decoded.id
    })
    .catch(() => {
      return res.status(401).json({ error: 'Token invalid' })
    })

  return next()
}
