import { Router } from 'express'

import SessionController from './app/controllers/SessionController'

import authMiddleware from './app/middlewares/auth'

const routes = new Router()

routes.post('/sessions', SessionController.store)
routes.use(authMiddleware)
routes.get('/', (req, res) => {
  return res.json({ message: req.userId })
})

export default routes
