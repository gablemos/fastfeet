import * as Yup from 'yup'
import { Op } from 'sequelize'

import Recipient from '../models/Recipient'

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number()
        .integer()
        .positive()
        .required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipCode: Yup.string().required(),
    })

    const bodyIsNotValid = !(await schema.isValid(req.body))

    if (bodyIsNotValid) {
      const validationErrors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => err.errors)

      return res.status(400).json({ errors: validationErrors })
    }

    const recipientExists = await Recipient.findOne({
      where: {
        [Op.and]: [{ number: req.body.number }, { zipCode: req.body.zipCode }],
      },
    })

    if (recipientExists) {
      return res.status(400).json({
        error: 'User already exists',
      })
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    } = await Recipient.create(req.body)

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    })
  }
}

export default new RecipientController()
