const { Router } = require('express')
const express = require('express')
const multer = require('multer')
const { dirname, join, extname } = require('path')
const { fileURLToPath } = require('url')

const CURRENT_DIR = dirname(__filename);
const MIMETYPES = ["image/jpeg", "image/png", "application/pdf"]
const MIMETYPES_IMG = ["image/jpeg", "image/png"]

const multerUpload = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/paymentProof"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 10000000
    }
})

const multerUploadRutRif = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/rutRif"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES_IMG.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 30000000  // 30 megabytes en bytes
    }
})

const multerUploadProfilePic = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/profilePic"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES_IMG.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES_IMG.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 10000000
    }
})

const multerUploadDocFront = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/docfront"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES_IMG.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES_IMG.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 30000000  // 30 megabytes en bytes
    }
})

const multerUploadDocReverse = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/docreverse"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES_IMG.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES_IMG.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 30000000  // 30 megabytes en bytes
    }
})

const multerUploadbankCertification = multer({
    storage: multer.diskStorage({
        destination: join(CURRENT_DIR, "../image/bankcertification"),
        filename: (req, file, cb) => {
            const fileExtension = extname(file.originalname);
            const fileName = file.originalname.split( fileExtension)[0] 

            cb(null, `${fileName}-${Date.now()}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb)=> {
        if (MIMETYPES_IMG.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Only ${MIMETYPES_IMG.join(" ")} mimetypes are allowed`))
        }
    }, 
    limits: {
        fieldSize: 30000000  // 30 megabytes en bytes
    }
})

const uploadRoute = Router()


uploadRoute.post("/", multerUpload.single("file"), async (req, res)=> {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

uploadRoute.post("/rutrif", multerUploadRutRif.single("file"), async (req, res)=> {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

uploadRoute.post("/profilepic", multerUploadProfilePic.single("file"), async (req, res) => {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({ error: error.message})
    }
})

uploadRoute.post("/docfront", multerUploadDocFront.single("file"), async (req, res) => {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({ error: error.message})
    }
})

uploadRoute.post("/docreverse", multerUploadDocReverse.single("file"), async (req, res) => {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({ error: error.message})
    }
})

uploadRoute.post("/bankcertification", multerUploadbankCertification.single("file"), async (req, res) => {
    try {
        res.status(201).json(req.file.filename)
    } catch (error) {
        res.status(404).json({ error: error.message})
    }
})

uploadRoute.use("/profilepic", express.static(join(CURRENT_DIR, "../image/profilePic")))

uploadRoute.use("/rutrif", express.static(join(CURRENT_DIR, "../image/rutRif")))

uploadRoute.use("/docfront", express.static(join(CURRENT_DIR, "../image/docfront")))

uploadRoute.use("/docreverse", express.static(join(CURRENT_DIR, "../image/docreverse")))

uploadRoute.use("/bankcertification", express.static(join(CURRENT_DIR, "../image/bankcertification")))

uploadRoute.use("/", express.static(join(CURRENT_DIR, "../image/paymentProof")))


module.exports = uploadRoute