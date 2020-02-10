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
        error: 'Recipient already exists',
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

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number()
        .integer()
        .positive(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipCode: Yup.string(),
    })

    const numberEmpty = !req.query.number

    const bodyIsNotValid = !(await schema.isValid(req.body))

    if (numberEmpty || bodyIsNotValid) {
      const validationErrors = await schema
        .validate(req.body, { abortEarly: false })
        .then(() => ['Query param number is required'])
        .catch(err => err.errors)

      return res.status(400).json({ errors: validationErrors })
    }

    const zipCodeInvalid = !(await Recipient.findOne({
      where: { zipCode: req.params.zipCode },
    }))
    if (zipCodeInvalid) {
      return res.status(401).json({ error: `Zip Code is invalid` })
    }

    if (req.body.number && req.body.zipCode) {
      const recipient = await Recipient.findOne({
        where: {
          [Op.and]: [
            { number: req.body.number },
            { zipCode: req.body.zipCode },
          ],
        },
      })

      if (recipient) {
        return res.status(400).json({
          error: 'Recipient already exists',
        })
      }
    }

    const recipient = await Recipient.findOne({
      where: {
        [Op.and]: [
          { number: req.query.number },
          { zipCode: req.params.zipCode },
        ],
      },
    })

    const recipientDoesNotExist = !recipient

    if (recipientDoesNotExist) {
      return res.status(404).json({
        error: 'Recipient not found',
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
    } = await recipient.update(req.body)

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
