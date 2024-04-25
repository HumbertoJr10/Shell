const { Router } = require('express');
const uploadRoute = require('./uploadRoute')
const userRoute = require('./userRoute')
const mailRoute = require('./mailRoute')

const router = Router()

router.use("/upload", uploadRoute)

router.use("/user", userRoute)

router.use('/mail', mailRoute)

module.exports = router;