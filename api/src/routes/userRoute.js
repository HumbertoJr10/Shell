const { Router } = require('express')
const { User, Client, Transaction, Factura, PaymentMethod } = require("../db")
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
require('dotenv').config()
const privateSecret = process.env.SECRET || "secretKy"

const userRoute = Router()

userRoute.get("/", async (req, res)=> {
    try {
        const allUser = await User.findAll({include: [Client, Transaction]})

        res.status(200).json(allUser)
    } catch (error) {
        res.status(400).json(error.message)
    }
})

userRoute.get("/ip", async (req, res) => {
    try {
        const response = await fetch('http://ip-api.com/json');
        const data = await response.json();


        
        res.json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la ubicación.' });
      }
})

userRoute.get("/find/:id", async(req, res) => {
    try {
        const { id } = req.params

        const user = await User.findByPk(id, { include: [ {
            model: Transaction,
            include: [Client, Factura, PaymentMethod]
        }, 
        {
            model: Client
        } ]})

        if (!user) {
            return res.status(404).json({error: "No existe usuario con el ID " + id})
        }

        return res.status(200).json(user)

    } catch (error) {
        return res.status(404).json({error: error.message})
    }
})

userRoute.post("/find/:email", async (req, res) => {
    try {
        const { email } = req.params

        const user = await User.findOne({
            where: { email }, include: [Client, Transaction]
        });

        if (!user) {
            return res.status(200).json({error: 'No existe usuario con este email'})
        } 

        const format = {
            name: user.name,
            lastName: user.lastName,
            id: user.id,
            role: user.role,
            clientId: user.clientId,
            email: user.email
        }
            
        return res.status(200).json(format)

    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

userRoute.post("/", async (req, res) => {
    try {
        const {name, lastName, email, password } = req.body

        if (!name || !lastName || !email || !password) {
            return res.status(404).json({ error: "Faltan parametros"})
        }

        const verify = await User.findOne({ where: { email }})

        if (verify) {
            return res.status(404).json({error: "Email ya se encuentra en uso"})
        }

        // ENCRIPTAMOS LA PASSWORD
        const hashPassword = await bcryptjs.hash(password, 8)

        const newUser = await User.create({ name, lastName, email, password: hashPassword })

        // if (clientId) {
        //     const client = await Client.findByPk(clientId)
        //     await newUser.setClient(client)
        //     return res.status(201).json(newUser)
        // } else {

        //     const newClient = await Client.create({ nombre: name, email})
        //     await newUser.setClient(newClient)
        //     return res.status(201).json(newUser)
        // }

        return res.status(201).json(newUser)


    } catch (error) {
        res.status(400).json(error.message)
  }  
})

userRoute.post("/login", async (req, res)=> {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email }, include: Client});

        if (!user) {
            return res.status(404).json({ error: 'No existe usuario registrado con ese email'})
        }


        if (!user.password) {
            return res.status(404).json({error: "Este usuario aun no ha registrado una contraseña. Intenta iniciar sesion con google"})
        }

        if (user.client?.id || user.role == "Super Admin") {
            return res.status(404).json({error: "Inicie sesion por el panel de Staff"})
        }

        let compare = bcryptjs.compareSync(password, user.password)

        if (compare) {
            const token = jwt.sign({ id: user.id }, privateSecret);
            return res.status(200).json({
                token, 
                id: user.id, 
                name: user.name, 
                lastName: user.lastName, 
                email: user.email, 
                role: user.role,
                clientId: user.client?.id,
                clients: user.clients
            });
        } 
        
        res.status(401).json({ error: 'Contraseña incorrecta' });
        
    } catch (error) {
        res.status(400).json({error: error.message})        
    }
})

userRoute.post("/loginStaff", async (req, res)=> {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email }, include: Client});

        if (!user) {
            return res.status(404).json({ error: 'No existe usuario registrado con ese email'})
        }

        if (!user.password) {
            return res.status(404).json({error: "Este usuario aun no ha registrado una contraseña. Intenta iniciar sesion con google"})
        }

        if (user.role == "Super Admin" || user.clients.length) {
            let compare = bcryptjs.compareSync(password, user.password)
            
            if (compare) {
                const token = jwt.sign({ id: user.id }, privateSecret);
                return res.status(200).json({
                    token, 
                    id: user.id, 
                    name: user.name, 
                    lastName: user.lastName, 
                    email: user.email, 
                    role: user.role,
                    clientId: user.client?.id,
                    clients: user.clients
                });
            } else {

                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        }


        return res.status(404).json({error: "Este usuario no es parte de ningun Staff"})

        
    } catch (error) {
        res.status(409).json({error: error.message})        
    }
})

userRoute.post("/google", async (req, res) => {
    try {

        const { name, email } = req.body

        if (!name || !email) {
            return res.status(404).json({error: "Name or Email error"})
        }

        const user = await User.findOne({ where: { email }})

        if (user) {
            const token = jwt.sign({ id: user.id }, privateSecret);
            return res.status(200).json({
                token, 
                id: user.id, 
                name: user.name, 
                lastName: user.lastName, 
                email: user.email, 
                docID: user.docID, 
                passaportID: user.passaportID,
                role: user.role,
                gender: user.gender,
                birthDate: user.birthDate,
                picture: user.picture,
                phoneNumber: user.phoneNumber,              
                expirationPP: newUser.expirationPP,
                expirationID: newUser.expirationID,
                IDType: newUser.IDType


            });
        }

        const newUser = await User.create({ name, email })
        const token = jwt.sign({ id: newUser.id }, privateSecret);
        return res.status(201).json({
                token, 
                id: newUser.id, 
                name: newUser.name, 
                lastName: newUser.lastName, 
                email: newUser.email, 
                docID: newUser.docID, 
                passaportID: newUser.passaportID,
                role: newUser.role,
                gender: newUser.gender,
                birthDate: newUser.birthDate,
                picture: newUser.picture,
                phoneNumber: newUser.phoneNumber,                
                expirationPP: newUser.expirationPP,
                expirationID: newUser.expirationID,
                IDType: newUser.IDType

        })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

userRoute.put("/:id", async (req, res) => {
    try {

        const { id } = req.params
        const { password } = req.body
        const user = await User.findByPk(id)

        
        if (!user) {
            return res.status(404).json({error: "User does not exist"})
        }
        console.log(req.body)
        if (password) {
            const hashPassword = await bcryptjs.hash(password, 8)
            const updateForm = {
                ...req.body,
                password: hashPassword
            }
            await user.update(updateForm)
            
            const token = jwt.sign({ id: user.id }, privateSecret);
            return res.status(200).json({
                token, 
                id: user.id, 
                name: user.name, 
                lastName: user.lastName, 
                email: user.email, 
                docID: user.docID, 
                passaportID: user.passaportID,
                role: user.role,
                gender: user.gender,
                birthDate: user.birthDate,
                picture: user.picture,
                phoneNumber: user.phoneNumber,              
                expirationPP: user.expirationPP,
                expirationID: user.expirationID,
                IDType: user.IDType
            });
        }



        await user.update(req.body)
        
        const token = jwt.sign({ id: user.id }, privateSecret);
        return res.status(200).json({
            token, 
            id: user.id, 
            name: user.name, 
            lastName: user.lastName, 
            email: user.email, 
            docID: user.docID, 
            passaportID: user.passaportID,
            role: user.role,
            gender: user.gender,
            birthDate: user.birthDate,
            picture: user.picture,
            phoneNumber: user.phoneNumber,
            expirationPP: user.expirationPP,
            expirationID: user.expirationID,
            IDType: user.IDType

        });

        
    } catch (error) {
        res.status(404).json({error: error.message})
    }   
})

userRoute.put("/add/:idUser/:idClient", async (req, res) => {
    try {
        const { idUser, idClient } = req.params

        const user = await User.findByPk(idUser)
        const client = await Client.findByPk(idClient)

        if (!user || !client) {
            return res.status(404).json({error: "No existe el usuario o cliente"})
        }

        await user.addClient(client)

        return res.status(201).json(user)


    } catch (error) {
        return res.status(404).json({ error: error.message})
    }
})

userRoute.delete("/remove/:id/:idClient", async (req, res) => {
    try {
        const { id, idClient } = req.params

        const user = await User.findByPk(id)
        const client = await Client.findByPk(idClient)
        if (!user || !client) {
            return res.status(404).json({error: "No existe el usuario o cliente"})
        }

        await user.removeClient(client)

        return res.status(201).json({ success: "Se ha eliminado este usuario del staff"})

    } catch (error) {
        return res.status(404).json({ error: error.message})
    }
})

userRoute.post("/v2/register", async (req, res) => {
    try {
        
        const {name, lastName, email, password } = req.body

        if (!name || !lastName || !email || !password) {
            return res.status(404).json({ error: "Debe incluir Nombre, Apellido, Email y Contraseña"})
        }

        const verify = await User.findOne({ where: { email: email.toLowerCase() }})

        if (verify) {
            return res.status(404).json({error: "Email ya se encuentra en uso"})
        }

        // ENCRIPTAMOS LA PASSWORD
        const hashPassword = await bcryptjs.hash(password, 8)
        const newUser = await User.create({ name, lastName, email: email.toLowerCase(), password: hashPassword })

        res.status(200).json({success: "El usuario ha sido creado con exito"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

userRoute.post('/v2/login', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Buscar al usuario en la base de datos
        const user = await User.findOne({ where: { email: email.toLowerCase() }, include: Client});

        if (!user) {
            return res.status(404).json({error: "No existe ningun usuario registrado con este email"})
        }

        if (user.role != "Usuario Básico") {
            // return res.status(404).json({error: "Este usuario es parte del staff. Debe iniciar sesion por el login de staff"})
        }

    
        if (user && await bcryptjs.compare(password, user.password)) {
            // Generar un token JWT
            const token = jwt.sign({ email }, 'secreto')
    
            res.json({ token });
        } else {
            res.status(401).send({ error: 'Credenciales inválidas'});
        }
    } catch (error) {
            res.status(500).send({ error: error.message });
    }
});

userRoute.post('/v2/loginstaff', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Buscar al usuario en la base de datos
        const user = await User.findOne({ where: { email: email.toLowerCase() }, include: Client});

        if (!user) {
            return res.status(404).json({error: "No existe ningun usuario registrado con este email"})
        }

        if (user.role == "Usuario Básico") {
            return res.status(404).json({error: "Este cliente no forma parte de ningun staff. Por favor inicia sesion como usuario básico"})
        }
    
        if (user && await bcryptjs.compare(password, user.password)) {
            // Generar un token JWT
            const token = jwt.sign({ email }, 'secreto');
    
            res.json({ token });
        } else {
            res.status(401).send({ error: 'Credenciales inválidas'});
        }
    } catch (error) {
            res.status(500).send({ error: error.message });
    }
});

userRoute.post('/v2/data', async (req, res) => {
    try {
        const { token } = req.body;
        console.log(token)
        // Verifica y desencripta el token utilizando la clave secreta
        jwt.verify(token, 'secreto', async (error, decoded) => {
        if (error) {
            // Si hay un error en la verificación del token, devuelve un error
            return res.status(401).json({ error: 'Token inválido' });
        }
        console.log(decoded)
        // El token es válido, `decoded` contiene la información del token
        const userEmail = decoded.email;

        // Busca al usuario en la base de datos usando la información del token
        const user = await User.findOne({ where: { email: userEmail }, include: Client });

        if (user) {
            // Devuelve la información del usuario
            res.status(200).json(user)
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

userRoute.post("/emailrestore", async (req, res) => {
    try {
        const { id } = req.body

        if (!id) {
            return res.status(404).json({error: "ID no valido"})
        }

        const user = await User.findByPk(id)


        if (!user) {
            return res.status(404).json({error: "No existe el usuario"})
        }

        if (!user.request_email) {
            return res.status(404).json({error: "LINK EXPIRADO"})
        }

        if (!user.pre_email) {
            return res.status(404).json({error: "Vuelva a solicitar su cambio de email"})
        }

        const newEmail = user.pre_email

        await user.update({email: newEmail, pre_email: "", request_email: false })

        return res.status(200).json({success: "Se ha cambiado su email satisfactoriamente"})

    } catch (error) {
        return res.status(500).json({error: error.message})
    }
})


module.exports = userRoute