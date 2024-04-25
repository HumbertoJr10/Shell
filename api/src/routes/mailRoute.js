const { Router } = require('express')
const nodemailer = require('nodemailer');
const { getAirline, frontend } = require('../../config');
const moment = require('moment')
const jwt = require('jsonwebtoken')
const numeral = require('numeral');
const { User, Reserve, Flight, Travaler, PaymentMethod, GlobalMethod, Transaction, Client, Buyer, Factura, Withdrawal } = require("../db")
const bcryptjs = require('bcryptjs');


require('dotenv').config()

const mailRoute = Router()
const myUrl = process.env.FRONTEND || 'http://localhost:5173'
const backendURL = process.env.BACKEND || 'http://localhost:3001'
const defaultEmail = process.env.DEFAULT_EMAIL

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'ticketfacil5@gmail.com',
//         pass: 'oanctogekklihrtc'

//     }
// })

let mainEmail = 'no-responder@pagototal.net'

let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Reemplaza con la información proporcionada por Hostinger
    port: 465, // Puerto SMTP de Hostinger   
    secure: true, 
    auth: {
        user: mainEmail,
        pass: 'Pago.123'
    }
});


const generarNumero = () => {
    const numeroAleatorio = Math.floor(Math.random() * 1000); // Generar número aleatorio entre 0 y 999
    const numeroFormateado = numeroAleatorio.toString().padStart(4, '0'); // Formatear con ceros a la izquierda si es necesario
    return numeroFormateado;
}

// SELECCION DE METODO DE PAGO *
mailRoute.post('/method', async (req, res)=> {    
    try {

        const { metodoId, email, id } = req.body

        var fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");

        const transaction = await Transaction.findByPk(id, { include: [PaymentMethod, GlobalMethod, Buyer, Client, User, Factura]})
        const method = await GlobalMethod.findByPk(metodoId)

        if (!method) {
            return res.status(404).json({error: "No existe el metodo con el id " + metodoId})
        }

        let aux = ``
        let account = method.config.account

        if (account) {

            account.forEach( (e, i) => {

                let miniaux = ``
                Object.keys(e).forEach( (dato, indice) => {
                    miniaux = miniaux + `
                    <p><strong>${dato}:</strong> ${Object.values(e)[indice]}<p>
                    `
                })
    
                aux = aux + `
                <div style="padding: 10px; border: 1px solid rgba(241, 241, 241); margin-bottom: 10px; ">
                    ${miniaux}
                </div>
                `
            })
    
    
        } else {
            aux = `<p style="color: red">No hay cuentas asociadas a este método de pago</p>`
        }


        let mailOptions = {
            from: mainEmail,
            to: email,
            subject: "Ha seleccionado el metodo de pago",
            text:"Ha seleccionado el metodo de pago",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Método de Pago Seleccionado</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">Hola ${transaction?.buyer?.buyer_name + " " + transaction?.buyer?.buyer_lastName},</p>
            //         <p style="font-size: 16px; color: #555;">Usted ha seleccionado el método de pago <strong>${method.name}</strong>.</p>
            //         <p style="font-size: 16px; color: #555;">Tiene 24 horas para subir la información correspondiente al pago.</p>
            //         <p style="font-size: 16px; color: #555;">Gracias por elegir nuestro servicio.</p>
            //         <h1 style="font-size: 18px; color: #555;">Puede realizar su pago a cualquiera de las siguientes cuentas:</h1>
            //         ${aux}            
            //         <a href="${myUrl}/payment/${id}">Ir al pago<a/>
            //         </div>
            // </div>
            // `,
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t106{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t107{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t154{padding:48px 50px!important;width:500px!important}.t110,.t146,.t152,.t2,.t21,.t24,.t5,.t51,.t55,.t58,.t61,.t64,.t73,.t77,.t80,.t83,.t86,.t91,.t95{width:600px!important}.t143{padding-bottom:44px!important;width:800px!important}.t47{width:760px!important}.t15,.t66,.t88{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t27{width:250px!important}.t45{max-width:820px!important}.t31,.t35,.t39{padding-left:10px!important;width:590px!important}.t104{width:520px!important}.t70{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t102,.t71{width:50%!important;max-width:800px!important}.t68{padding-bottom:0!important;padding-right:5px!important}.t100{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t106{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t107{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t154{padding:48px 50px!important;width:500px!important}.moz-text-html .t110{width:600px!important}.moz-text-html .t143{padding-bottom:44px!important;width:800px!important}.moz-text-html .t152{width:600px!important}.moz-text-html .t47{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t24,.moz-text-html .t5{width:600px!important}.moz-text-html .t27{width:250px!important}.moz-text-html .t45{max-width:820px!important}.moz-text-html .t35,.moz-text-html .t39{padding-left:10px!important;width:590px!important}.moz-text-html .t104{width:520px!important}.moz-text-html .t70{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t71{width:50%!important;max-width:800px!important}.moz-text-html .t68{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t102{width:50%!important;max-width:800px!important}.moz-text-html .t100{padding-left:5px!important}.moz-text-html .t31{padding-left:10px!important;width:590px!important}.moz-text-html .t66{width:800px!important}.moz-text-html .t51,.moz-text-html .t55,.moz-text-html .t58,.moz-text-html .t61,.moz-text-html .t64{width:600px!important}.moz-text-html .t88{width:800px!important}.moz-text-html .t146,.moz-text-html .t21,.moz-text-html .t73,.moz-text-html .t77,.moz-text-html .t80,.moz-text-html .t83,.moz-text-html .t86,.moz-text-html .t91,.moz-text-html .t95{width:600px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t106{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t107{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t154{padding:48px 50px !important;width:600px !important}td.t110{width:600px !important}td.t143{padding-bottom:44px !important;width:800px !important}td.t152{width:600px !important}td.t15,td.t47{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t24,td.t5{width:600px !important}td.t27{width:250px !important}div.t45{max-width:820px !important}td.t35,td.t39{padding-left:10px !important;width:600px !important}td.t104{width:600px !important}div.t70{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t71{width:50% !important;max-width:800px !important}td.t68{padding-bottom:0 !important;padding-right:5px !important}div.t102{width:50% !important;max-width:800px !important}td.t100{padding-left:5px !important}td.t31{padding-left:10px !important;width:600px !important}td.t66{width:800px !important}td.t51,td.t55,td.t58,td.t61,td.t64{width:600px !important}td.t88{width:800px !important}td.t146,td.t21,td.t73,td.t77,td.t80,td.t83,td.t86,td.t91,td.t95{width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t158" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t157" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t156" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t106" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t108" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t107" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t107" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Fecha: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/6f1727ad-c460-4b67-b25c-18501b969656.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Hola ${transaction?.buyer?.buyer_name} ${transaction?.buyer?.buyer_lastName}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Usted ha seleccionado el metodo de pago ${method.name} en la transaccion ref. PagoTotal: ${transaction.id}. Le recordamos que tiene 24 horas para subir la informacion correspondiente al pago, de lo contrario su transaccion expirará.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t24" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t23" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Gracias por elegir nuestro servicio.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t28" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t27" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t27" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t26" href="https://dashboard.pagototal.net/payment/${id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">Formalizar pago</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t29" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t48" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t47" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t47" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t46" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t41" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t45" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t44" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43"><tr>
            <td class="t42"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t32" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t31" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t31" style="width:480px;"><![endif]-->
            <h1 class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">${transaction.description}</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t33" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t36" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t35" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t35" style="width:480px;"><![endif]-->
            <h1 class="t34" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">${transaction.client.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t38" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t40" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t39" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t39" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;"><![endif]-->
            <h1 class="t37" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction.currency.simbol}</h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t41" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t105" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t104" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t104" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t103" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t71" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t69"><tr>
            <td class="t68" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t67" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t66" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t66" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t51" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t51" style="width:480px;"><![endif]-->
            <h1 class="t50" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">cOMPRADOR</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t53" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t56" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t55" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t55" style="width:480px;"><![endif]-->
            <p class="t54" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t59" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t58" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t58" style="width:480px;"><![endif]-->
            <p class="t57" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="width:480px;"><![endif]-->
            <p class="t60" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t65" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t64" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t64" style="width:480px;"><![endif]-->
            <p class="t63" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t70" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t102" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101"><tr>
            <td class="t100"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t89" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t88" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t88" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t74" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t73" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t73" style="width:480px;"><![endif]-->
            <h1 class="t72" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">dirección</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t75" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t78" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t77" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t77" style="width:480px;"><![endif]-->
            <p class="t76" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <p class="t79" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t84" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t83" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t83" style="width:480px;"><![endif]-->
            <p class="t82" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t87" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t86" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t86" style="width:480px;"><![endif]-->
            <p class="t85" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t97" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t99" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t98" style="width:279px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t98" style="width:279px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t92" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t91" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t91" style="width:480px;"><![endif]-->
            <h1 class="t90" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">mÉTODO DE PAGO</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t93" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t96" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t95" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t95" style="width:480px;"><![endif]-->
            <p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${method.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t155" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t154" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t154" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t111" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t110" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t110" style="width:480px;"><![endif]-->
            <p class="t109" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t144" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t143" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t143" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t142" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t113" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t117" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t116" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t115"><tr>
            <td class="t114"><div style="font-size:0px;"><img class="t112" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/016afe68-165a-4531-974d-a192db3d9749.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t113" style="width:10px;" width="10"></td><td class="t119" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t123" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t122" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t121"><tr>
            <td class="t120"><div style="font-size:0px;"><img class="t118" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/1a4563a1-f9fc-47ea-bf14-7592f3bf0624.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t119" style="width:10px;" width="10"></td><td class="t125" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t129" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t128" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t127"><tr>
            <td class="t126"><div style="font-size:0px;"><img class="t124" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/4e614f7c-8966-4a75-a49a-f811d99ec412.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t125" style="width:10px;" width="10"></td><td class="t131" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t135" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t134" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t133"><tr>
            <td class="t132"><div style="font-size:0px;"><img class="t130" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/5da03c7c-b20c-46a4-b4dc-d21742b2cc72.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t131" style="width:10px;" width="10"></td><td class="t137" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t141" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t140" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t139"><tr>
            <td class="t138"><div style="font-size:0px;"><img class="t136" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://3fcf2214-cc20-4d7f-bd33-d8c182d5ad04.b-cdn.net/e/4acf12f2-5470-4ff3-8aad-2911e0030741/91bb9368-ea31-4bca-9d3c-0f24a12102f5.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t137" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t147" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t146" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t146" style="width:480px;"><![endif]-->
            <p class="t145" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">Pago Total</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t153" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t152" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t152" style="width:480px;"><![endif]-->
            <p class="t151" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t148" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t149" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t150" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `

        }

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).json({ error: error.message})
            } else {
                return res.status(200).json('Mensaje enviado')
            }
        })

    } catch (error) {
        return res.status(404).json({error: error.message})
    }
})

// OLVIDO LA CONTRASEÑA * 
mailRoute.post("/forget", async (req, res)=> {
    try {
        const { email } = req.body
        var fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");

        
        const user = await User.findOne({ where: { email: email }});

        if (!user) {
            return res.status(404).json({error: "Email no pertenece a ningun usuario"})
        }

        const newPass = `pass-${generarNumero()}`
        const hashedNewPass = await bcryptjs.hash(newPass, 8);

        await user.update({password: hashedNewPass})

        let mailOptions = {
            from: mainEmail,
            to: user.email,
            subject: "Se ha restablecido tu contraseña",
            text: "Se ha restablecido tu contraseña",
            // html: `
            //     <div style="background-color: #a9afb3; width: 100%; height: 100vh; display: table;">
            //         <div style="display: table-cell; vertical-align: middle;">                                        
            //             <div style="width: 500px; background-color: white; border-radius: 5px; margin: 0 auto;">
            //                 <div class="header" style="padding: 10px; border-bottom: 1px solid #c5c5c5; background-color: #1b263b; color: white;">
            //                     <h2 style="margin: 0;">Tu contraseña fue restablecida</h2>
            //                 </div>
            //                 <div class="body" style="padding: 10px; border-bottom: 1px solid #c5c5c5;">
            //                     <p> Hola ${user.name}, has indicado que olvidaste tu contraseña. asi que aqui te mandamos tus nuevas credenciales para que puedas iniciar sesión: </p>
            //                     <p><strong>Email:</strong> ${user.email}</p>
            //                     <p><strong>Contraseña:</strong> ${newPass}</p>                                
            //                 </div>
            //                 <div class="footer" style="padding: 10px;">
            //                     <p><a href="${myUrl}/login">Click aqui</a> para ir al inicio de sesión</p>
            //                 </div>
            //             </div>
            //         </div>
            //     </div>
            // `
            html: `
                <!--
                * This email was built using Tabular.
                * For more information, visit https://tabular.email
                -->
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                <head>
                <title></title>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <!--<![endif]-->
                <meta name="x-apple-disable-message-reformatting" content="" />
                <meta content="target-densitydpi=device-dpi" name="viewport" />
                <meta content="true" name="HandheldFriendly" />
                <meta content="width=device-width" name="viewport" />
                <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
                <style type="text/css">
                table {
                border-collapse: separate;
                table-layout: fixed;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt
                }
                table td {
                border-collapse: collapse
                }
                .ExternalClass {
                width: 100%
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                line-height: 100%
                }
                body, a, li, p, h1, h2, h3 {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
                }
                html {
                -webkit-text-size-adjust: none !important
                }
                body, #innerTable {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale
                }
                #innerTable img+div {
                display: none;
                display: none !important
                }
                img {
                Margin: 0;
                padding: 0;
                -ms-interpolation-mode: bicubic
                }
                h1, h2, h3, p, a {
                line-height: 1;
                overflow-wrap: normal;
                white-space: normal;
                word-break: break-word
                }
                a {
                text-decoration: none
                }
                h1, h2, h3, p {
                min-width: 100%!important;
                width: 100%!important;
                max-width: 100%!important;
                display: inline-block!important;
                border: 0;
                padding: 0;
                margin: 0
                }
                a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important
                }
                u + #body a {
                color: inherit;
                text-decoration: none;
                font-size: inherit;
                font-family: inherit;
                font-weight: inherit;
                line-height: inherit;
                }
                a[href^="mailto"],
                a[href^="tel"],
                a[href^="sms"] {
                color: inherit;
                text-decoration: none
                }
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                .hd { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (max-width: 480px) {
                .hm { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t35{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t36{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t83{padding:48px 50px!important;width:500px!important}.t2,.t21,.t25,.t29,.t39,.t5,.t75,.t81{width:600px!important}.t15,.t72{width:800px!important}.t72{padding-bottom:44px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t32{width:250px!important}
                }
                </style>
                <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t35{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t36{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t83{padding:48px 50px!important;width:500px!important}.moz-text-html .t39{width:600px!important}.moz-text-html .t72{padding-bottom:44px!important;width:800px!important}.moz-text-html .t75,.moz-text-html .t81{width:600px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t25,.moz-text-html .t29,.moz-text-html .t5{width:600px!important}.moz-text-html .t32{width:250px!important}</style>
                <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
                <!--<![endif]-->
                <!--[if mso]>
                <style type="text/css">
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t35{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t36{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t83{padding:48px 50px !important;width:600px !important}td.t39{width:600px !important}td.t72{padding-bottom:44px !important;width:800px !important}td.t75,td.t81{width:600px !important}td.t15{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t25,td.t29,td.t5{width:600px !important}td.t32{width:250px !important}
                </style>
                <![endif]-->
                <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                </head>
                <body id="body" class="t87" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t86" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t85" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
                <!--[if mso]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
                <v:fill color="#242424"/>
                </v:background>
                <![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t35" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
                <table class="t37" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t36" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t36" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t15" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
                <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
                <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
                <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t2" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
                <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Order confirmation</span></p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Fecha: ${fechaActual}</p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td><td width="130" valign="top"><![endif]-->
                <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
                <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/f88815fd-ab78-47a6-8908-346fb4a0fdd0.jpeg"/></div></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
                <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su contraseña fue reestablecida.</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola ${user.name} ${user.lastName} has indicado que olvidaste tu contraseña. asi que aqui te mandamos tus nuevas credenciales para que puedas iniciar sesión:</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t26" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t25" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t25" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t24" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t23" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Email: </span>${user.email}</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t30" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t29" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t29" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t28" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t27" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Contraseña:</span> ${newPass}</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t33" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
                <!--[if !mso]><!--><td class="t32" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t32" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
                <a class="t31" href="https://dashboard.pagototal.net/login" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">IniciAr Sesion</a></td>
                </tr></table>
                </td></tr><tr><td><div class="t34" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t84" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t83" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t83" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t40" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t39" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t39" style="width:480px;"><![endif]-->
                <p class="t38" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t72" style="width:480px;padding:10px 0 36px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t72" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
                <div class="t71" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t42" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t46" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t45" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t44"><tr>
                <td class="t43"><div style="font-size:0px;"><img class="t41" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/277e2851-d316-4579-9dd2-e286f8f4f5a9.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t42" style="width:10px;" width="10"></td><td class="t48" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t52" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t51" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t50"><tr>
                <td class="t49"><div style="font-size:0px;"><img class="t47" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/3abb9987-b18b-4380-912a-cb1d8c4327fd.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t48" style="width:10px;" width="10"></td><td class="t54" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t58" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t57" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t56"><tr>
                <td class="t55"><div style="font-size:0px;"><img class="t53" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/5614e7ae-d61a-4217-afc5-ee1f2a4b31fe.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t54" style="width:10px;" width="10"></td><td class="t60" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t64" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t63" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t62"><tr>
                <td class="t61"><div style="font-size:0px;"><img class="t59" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/db02c171-88b1-461b-a107-a9251460fe31.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t60" style="width:10px;" width="10"></td><td class="t66" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t70" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t69" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68"><tr>
                <td class="t67"><div style="font-size:0px;"><img class="t65" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/744145bd-a682-49f6-af3b-03ba2b7a44d5.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t66" style="width:10px;" width="10"></td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t75" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
                <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t81" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t81" style="width:480px;"><![endif]-->
                <p class="t80" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t77" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t78" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t79" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </td></tr></table></td></tr></table></div></body>
                </html>
            `
        }


        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).json({ error: error.message})
            } else {
                return res.status(200).json({ success: "La informacion de su cuenta fue enviada a su correo"})
            }
        })
        
    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

// SE HA CREADO SU CUENTA *
mailRoute.post('/register', async (req, res) => {
    try {

        const { email, name, lastName, password, id } = req.body
        var fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");


        let mailOptions = {
            from: mainEmail,
            to: email,
            subject: "Su cuenta ha sido creada",
            text:"Su cuenta ha sido creada",
            // html: `
            //     <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //         <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //             <h1 style="color: #333; font-size: 24px; text-align: center;">Se ha registrado su cuenta</h1>
            //             <hr style="border: 1px solid #ccc;">
            //             <p style="font-size: 16px; color: #555;">Hola ${name} ${lastName},</p>
            //             <p style="font-size: 16px; color: #555;">Su cuenta ha sido creada. a continuacion tiene toda la informacion para que pueda iniciar sesión:</p>
            //             <p style="font-size: 16px; color: #555;"><strong>Nombre: </strong> ${name} ${lastName}</p>
            //             <p style="font-size: 16px; color: #555;"><strong>Contraseña: </strong> ${password}</p>
            //             <p style="font-size: 16px; color: #555;"><strong>Email: </strong> ${email}</p>
            //             <p style="font-size: 16px; color: #555;"><strong>ID: </strong> ${id}</p>
            //         </div>
            //     </div>
            // `
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t35{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t36{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t83{padding:48px 50px!important;width:500px!important}.t2,.t21,.t25,.t29,.t39,.t5,.t75,.t81{width:600px!important}.t15,.t72{width:800px!important}.t72{padding-bottom:44px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t32{width:250px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t35{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t36{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t83{padding:48px 50px!important;width:500px!important}.moz-text-html .t39{width:600px!important}.moz-text-html .t72{padding-bottom:44px!important;width:800px!important}.moz-text-html .t75,.moz-text-html .t81{width:600px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t25,.moz-text-html .t29,.moz-text-html .t5{width:600px!important}.moz-text-html .t32{width:250px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t35{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t36{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t83{padding:48px 50px !important;width:600px !important}td.t39{width:600px !important}td.t72{padding-bottom:44px !important;width:800px !important}td.t75,td.t81{width:600px !important}td.t15{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t25,td.t29,td.t5{width:600px !important}td.t32{width:250px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t87" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t86" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t85" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t35" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t37" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t36" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t36" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Order confirmation</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Fecha: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/f88815fd-ab78-47a6-8908-346fb4a0fdd0.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su cuenta ha sido creada</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola ${name} ${lastName}. Su cuenta ha sido creada, a continuacion le enviamos toda la información para que pueda iniciar sesion:</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t26" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t25" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t25" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t24" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t23" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Email: </span>${email}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t30" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t29" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t29" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t28" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t27" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Contraseña:</span> ${password}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t33" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t32" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t32" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t31" href="https://dashboard.pagototal.net/login" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">IniciAr Sesion</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t34" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t84" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t83" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t83" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t40" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t39" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t39" style="width:480px;"><![endif]-->
            <p class="t38" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">PagoTotal</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t72" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t72" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t71" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t42" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t46" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t45" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t44"><tr>
            <td class="t43"><div style="font-size:0px;"><img class="t41" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/277e2851-d316-4579-9dd2-e286f8f4f5a9.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t42" style="width:10px;" width="10"></td><td class="t48" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t52" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t51" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t50"><tr>
            <td class="t49"><div style="font-size:0px;"><img class="t47" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/3abb9987-b18b-4380-912a-cb1d8c4327fd.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t48" style="width:10px;" width="10"></td><td class="t54" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t58" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t57" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t56"><tr>
            <td class="t55"><div style="font-size:0px;"><img class="t53" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/5614e7ae-d61a-4217-afc5-ee1f2a4b31fe.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t54" style="width:10px;" width="10"></td><td class="t60" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t64" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t63" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t62"><tr>
            <td class="t61"><div style="font-size:0px;"><img class="t59" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/db02c171-88b1-461b-a107-a9251460fe31.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t60" style="width:10px;" width="10"></td><td class="t66" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t70" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t69" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68"><tr>
            <td class="t67"><div style="font-size:0px;"><img class="t65" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/744145bd-a682-49f6-af3b-03ba2b7a44d5.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t66" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
            <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t81" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t81" style="width:480px;"><![endif]-->
            <p class="t80" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t77" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t78" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t79" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).json({ error: error.message})
            } else {
                return res.status(200).json('Mensaje enviado')
            }
        })
        
    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

// SE HA RECIBIDO UN NUEVO PAGO *
mailRoute.post('/payment', async (req, res)=> {    
    try {

        const { email, id } = req.body
        var fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");
        
        let adminEmail = "inscripcionespukiebook@gmail.com"
        // let adminEmail = "humbale11@gmail.com"


        const transaction = await Transaction.findByPk(id, { include: [PaymentMethod, GlobalMethod, Buyer, Client, Factura, User]})
        let payName = transaction.globalMethod.name 
        const client = await Client.findByPk(transaction.client.id, { include: User})

        const allUser = client.users

        let allEmailsAdmin = allUser.filter( e => e.role == "Administrador").map( e => {
            return e.email
        })

        // return res.status(200).json(client)

        const token = jwt.sign({ email: adminEmail }, 'secreto')

        if (!transaction) {
            return res.status(404).json({error: "No existe esta transaccion"})
        }

        let mailOptions = {
            from: mainEmail,
            to: email,
            subject: "Nuestro equipo está revisando su pago",
            text:"Nuestro equipo está revisando su pago",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago esta pendiente</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">Hemos recibido la información de su pago y estamos evaluandola.</p>
            //         <p style="font-size: 16px; color: #555;">Usted recibirá un email cuando su pago sea aprobado.</p>
            //         <p style="font-size: 16px; color: #555;">Muchas gracias por usar nuestro servicio.</p>
            //         <hr style="border: 1px solid #ccc;">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen</h1>
            //         <p><strong>Item:</strong> ${transaction?.description}</p>
            //         <p><strong>Identificador:</strong> {transaction?.id}</p>
            //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
            //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
            //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
            //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
            //         ${
            //             transaction?.factura?.type == "Empresa" ? 
            //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
            //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
            //         }
            //         ${
            //             transaction?.factura?.type == "Empresa" ?
            //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
            //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
            //         }
            //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
            //     </div>
            // </div>
            // `
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t128{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t129{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t176{padding:48px 50px!important;width:500px!important}.t102,.t105,.t108,.t113,.t117,.t132,.t168,.t174,.t2,.t21,.t5,.t73,.t77,.t80,.t83,.t86,.t95,.t99{width:600px!important}.t165{padding-bottom:44px!important;width:800px!important}.t69{width:760px!important}.t110,.t120,.t15,.t88{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t67{max-width:813px!important}.t28,.t33,.t37,.t43,.t48,.t52,.t57,.t61{padding-left:10px!important;width:590px!important}.t126{width:520px!important}.t92{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t124,.t93{width:50%!important;max-width:800px!important}.t90{padding-bottom:0!important;padding-right:5px!important}.t122{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t128{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t129{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t176{padding:48px 50px!important;width:500px!important}.moz-text-html .t132{width:600px!important}.moz-text-html .t165{padding-bottom:44px!important;width:800px!important}.moz-text-html .t168,.moz-text-html .t174{width:600px!important}.moz-text-html .t69{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t67{max-width:813px!important}.moz-text-html .t33,.moz-text-html .t61{padding-left:10px!important;width:590px!important}.moz-text-html .t126{width:520px!important}.moz-text-html .t92{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t93{width:50%!important;max-width:800px!important}.moz-text-html .t90{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t124{width:50%!important;max-width:800px!important}.moz-text-html .t122{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t88{width:800px!important}.moz-text-html .t73,.moz-text-html .t77,.moz-text-html .t80,.moz-text-html .t83,.moz-text-html .t86{width:600px!important}.moz-text-html .t110{width:800px!important}.moz-text-html .t102,.moz-text-html .t105,.moz-text-html .t108,.moz-text-html .t95,.moz-text-html .t99{width:600px!important}.moz-text-html .t120{width:800px!important}.moz-text-html .t113,.moz-text-html .t117{width:600px!important}.moz-text-html .t37,.moz-text-html .t43,.moz-text-html .t48,.moz-text-html .t52,.moz-text-html .t57{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t128{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t129{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t176{padding:48px 50px !important;width:600px !important}td.t132{width:600px !important}td.t165{padding-bottom:44px !important;width:800px !important}td.t168,td.t174{width:600px !important}td.t15,td.t69{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t67{max-width:813px !important}td.t33,td.t61{padding-left:10px !important;width:600px !important}td.t126{width:600px !important}div.t92{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t93{width:50% !important;max-width:800px !important}td.t90{padding-bottom:0 !important;padding-right:5px !important}div.t124{width:50% !important;max-width:800px !important}td.t122{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t88{width:800px !important}td.t73,td.t77,td.t80,td.t83,td.t86{width:600px !important}td.t110{width:800px !important}td.t102,td.t105,td.t108,td.t95,td.t99{width:600px !important}td.t120{width:800px !important}td.t113,td.t117{width:600px !important}td.t37,td.t43,td.t48,td.t52,td.t57{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t180" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t179" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t178" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t128" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t130" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t129" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t129" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/f88815fd-ab78-47a6-8908-346fb4a0fdd0.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su pago esta pendiente. PagoTotal ref: ${transaction.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hemos recibido la información de su pago y estamos evaluandola, usted recibirá un email cuando su pago sea aprobado o rechazado. Muchas gracias por usar nuestro servicio.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t26" href="https://dashboard.pagototal.net/payment/${id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">VERIFICAR TRANSACCION</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t69" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t69" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t68" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t63" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t67" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t66" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t65"><tr>
            <td class="t64"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">resumen</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <p class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">descripcion:</span> ${transaction?.description}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">identificador:</span> ${transaction?.id}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t44" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t43" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t43" style="width:480px;"><![endif]-->
            <p class="t42" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span><span class="t41" style="margin:0;Margin:0;mso-line-height-rule:exactly;"><span class="t40" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${transaction?.client?.nombre}</span></span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t49" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t48" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t48" style="width:480px;"><![endif]-->
            <p class="t47" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t45" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Metodo de pago: </span><span class="t46" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${transaction?.globalMethod?.name}</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t53" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t52" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t52" style="width:480px;"><![endif]-->
            <p class="t51" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t50" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">mONTO: ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t58" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t57" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t57" style="width:480px;"><![endif]-->
            <p class="t56" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t54" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">fecha: </span><span class="t55" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${moment(transaction?.payment_date).format("DD/MM/YY")}</span></p></td>
            </tr></table>
            </td></tr><tr><td><div class="t60" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;"><![endif]-->
            <h1 class="t59" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"> </h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t63" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t71" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t127" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t126" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t126" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t125" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t93" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t91"><tr>
            <td class="t90" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t89" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t88" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t88" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t74" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t73" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t73" style="width:480px;"><![endif]-->
            <h1 class="t72" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Comprador</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t75" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t78" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t77" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t77" style="width:480px;"><![endif]-->
            <p class="t76" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <p class="t79" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t84" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t83" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t83" style="width:480px;"><![endif]-->
            <p class="t82" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t87" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t86" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t86" style="width:480px;"><![endif]-->
            <p class="t85" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t92" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t124" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t123"><tr>
            <td class="t122"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t111" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t110" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t110" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t96" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t95" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t95" style="width:480px;"><![endif]-->
            <h1 class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t97" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t100" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t99" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t99" style="width:480px;"><![endif]-->
            <p class="t98" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t102" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
            <p class="t101" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t105" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
            <p class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t109" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t108" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t108" style="width:480px;"><![endif]-->
            <p class="t107" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t119" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t121" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t120" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t120" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t114" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t113" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t113" style="width:480px;"><![endif]-->
            <h1 class="t112" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">metodo de pago</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t115" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t118" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t117" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t117" style="width:480px;"><![endif]-->
            <p class="t116" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.globalMethod?.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t177" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t176" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t176" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t133" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t132" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t132" style="width:480px;"><![endif]-->
            <p class="t131" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t166" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t165" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t165" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t164" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t135" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t139" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t138" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t137"><tr>
            <td class="t136"><div style="font-size:0px;"><img class="t134" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/277e2851-d316-4579-9dd2-e286f8f4f5a9.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t135" style="width:10px;" width="10"></td><td class="t141" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t145" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t144" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t143"><tr>
            <td class="t142"><div style="font-size:0px;"><img class="t140" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/3abb9987-b18b-4380-912a-cb1d8c4327fd.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t141" style="width:10px;" width="10"></td><td class="t147" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t151" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t150" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t149"><tr>
            <td class="t148"><div style="font-size:0px;"><img class="t146" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/5614e7ae-d61a-4217-afc5-ee1f2a4b31fe.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t147" style="width:10px;" width="10"></td><td class="t153" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t157" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t156" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t155"><tr>
            <td class="t154"><div style="font-size:0px;"><img class="t152" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/db02c171-88b1-461b-a107-a9251460fe31.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t153" style="width:10px;" width="10"></td><td class="t159" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t163" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t162" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t161"><tr>
            <td class="t160"><div style="font-size:0px;"><img class="t158" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/744145bd-a682-49f6-af3b-03ba2b7a44d5.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t159" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t168" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t168" style="width:480px;"><![endif]-->
            <p class="t167" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t175" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t174" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t174" style="width:480px;"><![endif]-->
            <p class="t173" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t170" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t171" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t172" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        // return res.status(200).json({ payName, same: payName == "ePayco"})

        let mailAdministration = {
            from: mainEmail,
            to: adminEmail,
            subject: "Se ha registrado un nuevo pago",
            text:"Se ha registrado un nuevo pago",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago esta pendiente</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">Se ha registrado un nuevo pago en la transaccion  ${transaction?.id}.</p>
            //         <p style="font-size: 16px; color: #555;">Accede a la plataforma administrativa para gestionar esta transaccion.</p>
            //         <a href="${myUrl}/transactions?token=${token}">Ir a PagoTotal</a>
            //         <hr style="border: 1px solid #ccc;">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen</h1>
            //         <p><strong>Item:</strong> ${transaction?.description}</p>
            //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
            //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
            //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
            //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
            //         ${
            //             transaction?.factura?.type == "Empresa" ? 
            //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
            //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
            //         }
            //         ${
            //             transaction?.factura?.type == "Empresa" ?
            //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
            //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
            //         }
            //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
            //     </div>
            // </div>
            // `
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t168{padding:48px 50px!important;width:500px!important}.t100,.t105,.t109,.t124,.t160,.t166,.t2,.t21,.t5,.t65,.t69,.t72,.t75,.t78,.t87,.t91,.t94,.t97{width:600px!important}.t157{padding-bottom:44px!important;width:800px!important}.t61{width:760px!important}.t102,.t112,.t15,.t80{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t59{max-width:820px!important}.t28,.t33,.t37,.t41,.t45,.t49,.t53{padding-left:10px!important;width:590px!important}.t118{width:520px!important}.t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t116,.t85{width:50%!important;max-width:800px!important}.t82{padding-bottom:0!important;padding-right:5px!important}.t114{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t168{padding:48px 50px!important;width:500px!important}.moz-text-html .t124{width:600px!important}.moz-text-html .t157{padding-bottom:44px!important;width:800px!important}.moz-text-html .t160,.moz-text-html .t166{width:600px!important}.moz-text-html .t61{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t59{max-width:820px!important}.moz-text-html .t33{padding-left:10px!important;width:590px!important}.moz-text-html .t118{width:520px!important}.moz-text-html .t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t85{width:50%!important;max-width:800px!important}.moz-text-html .t82{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t116{width:50%!important;max-width:800px!important}.moz-text-html .t114{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t80{width:800px!important}.moz-text-html .t65,.moz-text-html .t69,.moz-text-html .t72,.moz-text-html .t75,.moz-text-html .t78{width:600px!important}.moz-text-html .t102{width:800px!important}.moz-text-html .t100,.moz-text-html .t87,.moz-text-html .t91,.moz-text-html .t94,.moz-text-html .t97{width:600px!important}.moz-text-html .t112{width:800px!important}.moz-text-html .t105,.moz-text-html .t109{width:600px!important}.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t45,.moz-text-html .t49,.moz-text-html .t53{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t120{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t121{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t168{padding:48px 50px !important;width:600px !important}td.t124{width:600px !important}td.t157{padding-bottom:44px !important;width:800px !important}td.t160,td.t166{width:600px !important}td.t15,td.t61{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t59{max-width:820px !important}td.t33{padding-left:10px !important;width:600px !important}td.t118{width:600px !important}div.t84{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t85{width:50% !important;max-width:800px !important}td.t82{padding-bottom:0 !important;padding-right:5px !important}div.t116{width:50% !important;max-width:800px !important}td.t114{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t80{width:800px !important}td.t65,td.t69,td.t72,td.t75,td.t78{width:600px !important}td.t102{width:800px !important}td.t100,td.t87,td.t91,td.t94,td.t97{width:600px !important}td.t112{width:800px !important}td.t105,td.t109{width:600px !important}td.t37,td.t41,td.t45,td.t49,td.t53{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t172" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t171" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t170" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t120" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t122" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t121" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t121" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Se ha registrado un nuevo pago. PagoTotal ref: ${transaction.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">En la transaccion con identificador ${transaction.id} se ha registrado un nuevo pago. Por favor accede a la plataforma administrativa de Pago Total para que gestiones esta transaccion</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t26" href="https://dashboard.pagototal.net/transactions" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">IR A PAGO TOTAL</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t60" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t55" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t59" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t58" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57"><tr>
            <td class="t56"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">DESCRIPCION: </span>${transaction?.description}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">IDENTIFICADOR: </span>${transaction?.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t41" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
            <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span>${transaction?.client?.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t46" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t45" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t45" style="width:480px;"><![endif]-->
            <h1 class="t44" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">METODO DE PAGO:</span> ${transaction?.globalMethod?.name}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t50" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t49" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t49" style="width:480px;"><![endif]-->
            <h1 class="t48" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t47" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">MONTO:</span> ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t54" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t53" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t53" style="width:480px;"><![endif]-->
            <h1 class="t52" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t51" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA:</span> ${moment(transaction?.payment_date).format("DD/MM/YY")}</h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t55" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t63" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t119" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t118" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t118" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t117" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
            <td class="t82" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t65" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
            <h1 class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">COMPRADOR</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t67" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t69" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t69" style="width:480px;"><![endif]-->
            <p class="t68" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t72" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t72" style="width:480px;"><![endif]-->
            <p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
            <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t78" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
            <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t84" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t116" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t115"><tr>
            <td class="t114"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t102" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t88" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t87" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t87" style="width:480px;"><![endif]-->
            <h1 class="t86" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t89" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t92" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t91" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t91" style="width:480px;"><![endif]-->
            <p class="t90" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t95" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t94" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t94" style="width:480px;"><![endif]-->
            <p class="t93" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t98" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t97" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t97" style="width:480px;"><![endif]-->
            <p class="t96" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t101" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t100" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t100" style="width:480px;"><![endif]-->
            <p class="t99" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t113" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t112" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t112" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t105" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
            <h1 class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">METODO DE PAGO</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t107" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t109" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t109" style="width:480px;"><![endif]-->
            <p class="t108" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"> ${transaction?.globalMethod?.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t168" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t168" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t125" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t124" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t124" style="width:480px;"><![endif]-->
            <p class="t123" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t158" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t157" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t157" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t156" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t127" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t131" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t130" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t129"><tr>
            <td class="t128"><div style="font-size:0px;"><img class="t126" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t127" style="width:10px;" width="10"></td><td class="t133" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t137" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t136" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t135"><tr>
            <td class="t134"><div style="font-size:0px;"><img class="t132" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t133" style="width:10px;" width="10"></td><td class="t139" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t143" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t142" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t141"><tr>
            <td class="t140"><div style="font-size:0px;"><img class="t138" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t139" style="width:10px;" width="10"></td><td class="t145" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t149" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t148" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t147"><tr>
            <td class="t146"><div style="font-size:0px;"><img class="t144" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t145" style="width:10px;" width="10"></td><td class="t151" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t155" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t154" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t153"><tr>
            <td class="t152"><div style="font-size:0px;"><img class="t150" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t151" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t161" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t160" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t160" style="width:480px;"><![endif]-->
            <p class="t159" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t167" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t166" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t166" style="width:480px;"><![endif]-->
            <p class="t165" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t162" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t163" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t164" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log({ problem: "Error al enviar email ", error: error.message })
            } else {
                console.log("Email al usuario Enviado ")
            }
        })        

        if (payName == "ePayco") {
            console.log("No se envia email por ser epayco")
        } else {
            
            transporter.sendMail(mailAdministration, (error, info) => {
                if (error) {
                    console.log({ problem: "Error al enviar email ", error: error.message })
                } else {
                    console.log("Email al Admin Enviado ")
                }
            })
        }


        for (let f=0; f<allEmailsAdmin.length; f++) {

            if (transaction.state == "1") {

                let mailAdministrationOne = {
                    from: mainEmail,
                    to: allEmailsAdmin[f],
                    subject: "Se ha registrado un nuevo pago",
                    text:"Se ha registrado un nuevo pago",
                    // html: `
                    // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
                    //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago esta pendiente</h1>
                    //         <hr style="border: 1px solid #ccc;">
                    //         <p style="font-size: 16px; color: #555;">Se ha registrado un nuevo pago en la transaccion  ${transaction?.id}.</p>
                    //         <p style="font-size: 16px; color: #555;">Accede a la plataforma administrativa para gestionar esta transaccion.</p>
                    //         <a href="${myUrl}/transactions?token=${token}">Ir a PagoTotal</a>
                    //         <hr style="border: 1px solid #ccc;">
                    //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen</h1>
                    //         <p><strong>Item:</strong> ${transaction?.description}</p>
                    //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
                    //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
                    //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
                    //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
                    //         ${
                    //             transaction?.factura?.type == "Empresa" ? 
                    //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
                    //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
                    //         }
                    //         ${
                    //             transaction?.factura?.type == "Empresa" ?
                    //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
                    //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
                    //         }
                    //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
                    //     </div>
                    // </div>
                    // `
                    html: `
                        <!--
                        * This email was built using Tabular.
                        * For more information, visit https://tabular.email
                        -->
                        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                        <head>
                        <title></title>
                        <meta charset="UTF-8" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <!--[if !mso]><!-->
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <!--<![endif]-->
                        <meta name="x-apple-disable-message-reformatting" content="" />
                        <meta content="target-densitydpi=device-dpi" name="viewport" />
                        <meta content="true" name="HandheldFriendly" />
                        <meta content="width=device-width" name="viewport" />
                        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
                        <style type="text/css">
                        table {
                        border-collapse: separate;
                        table-layout: fixed;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt
                        }
                        table td {
                        border-collapse: collapse
                        }
                        .ExternalClass {
                        width: 100%
                        }
                        .ExternalClass,
                        .ExternalClass p,
                        .ExternalClass span,
                        .ExternalClass font,
                        .ExternalClass td,
                        .ExternalClass div {
                        line-height: 100%
                        }
                        body, a, li, p, h1, h2, h3 {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                        }
                        html {
                        -webkit-text-size-adjust: none !important
                        }
                        body, #innerTable {
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale
                        }
                        #innerTable img+div {
                        display: none;
                        display: none !important
                        }
                        img {
                        Margin: 0;
                        padding: 0;
                        -ms-interpolation-mode: bicubic
                        }
                        h1, h2, h3, p, a {
                        line-height: 1;
                        overflow-wrap: normal;
                        white-space: normal;
                        word-break: break-word
                        }
                        a {
                        text-decoration: none
                        }
                        h1, h2, h3, p {
                        min-width: 100%!important;
                        width: 100%!important;
                        max-width: 100%!important;
                        display: inline-block!important;
                        border: 0;
                        padding: 0;
                        margin: 0
                        }
                        a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important
                        }
                        u + #body a {
                        color: inherit;
                        text-decoration: none;
                        font-size: inherit;
                        font-family: inherit;
                        font-weight: inherit;
                        line-height: inherit;
                        }
                        a[href^="mailto"],
                        a[href^="tel"],
                        a[href^="sms"] {
                        color: inherit;
                        text-decoration: none
                        }
                        img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
                        </style>
                        <style type="text/css">
                        @media (min-width: 481px) {
                        .hd { display: none!important }
                        }
                        </style>
                        <style type="text/css">
                        @media (max-width: 480px) {
                        .hm { display: none!important }
                        }
                        </style>
                        <style type="text/css">
                        @media (min-width: 481px) {
                        h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t168{padding:48px 50px!important;width:500px!important}.t100,.t105,.t109,.t124,.t160,.t166,.t2,.t21,.t5,.t65,.t69,.t72,.t75,.t78,.t87,.t91,.t94,.t97{width:600px!important}.t157{padding-bottom:44px!important;width:800px!important}.t61{width:760px!important}.t102,.t112,.t15,.t80{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t59{max-width:820px!important}.t28,.t33,.t37,.t41,.t45,.t49,.t53{padding-left:10px!important;width:590px!important}.t118{width:520px!important}.t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t116,.t85{width:50%!important;max-width:800px!important}.t82{padding-bottom:0!important;padding-right:5px!important}.t114{padding-left:5px!important}
                        }
                        </style>
                        <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t168{padding:48px 50px!important;width:500px!important}.moz-text-html .t124{width:600px!important}.moz-text-html .t157{padding-bottom:44px!important;width:800px!important}.moz-text-html .t160,.moz-text-html .t166{width:600px!important}.moz-text-html .t61{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t59{max-width:820px!important}.moz-text-html .t33{padding-left:10px!important;width:590px!important}.moz-text-html .t118{width:520px!important}.moz-text-html .t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t85{width:50%!important;max-width:800px!important}.moz-text-html .t82{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t116{width:50%!important;max-width:800px!important}.moz-text-html .t114{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t80{width:800px!important}.moz-text-html .t65,.moz-text-html .t69,.moz-text-html .t72,.moz-text-html .t75,.moz-text-html .t78{width:600px!important}.moz-text-html .t102{width:800px!important}.moz-text-html .t100,.moz-text-html .t87,.moz-text-html .t91,.moz-text-html .t94,.moz-text-html .t97{width:600px!important}.moz-text-html .t112{width:800px!important}.moz-text-html .t105,.moz-text-html .t109{width:600px!important}.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t45,.moz-text-html .t49,.moz-text-html .t53{padding-left:10px!important;width:590px!important}</style>
                        <!--[if !mso]><!-->
                        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
                        <!--<![endif]-->
                        <!--[if mso]>
                        <style type="text/css">
                        img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t120{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t121{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t168{padding:48px 50px !important;width:600px !important}td.t124{width:600px !important}td.t157{padding-bottom:44px !important;width:800px !important}td.t160,td.t166{width:600px !important}td.t15,td.t61{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t59{max-width:820px !important}td.t33{padding-left:10px !important;width:600px !important}td.t118{width:600px !important}div.t84{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t85{width:50% !important;max-width:800px !important}td.t82{padding-bottom:0 !important;padding-right:5px !important}div.t116{width:50% !important;max-width:800px !important}td.t114{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t80{width:800px !important}td.t65,td.t69,td.t72,td.t75,td.t78{width:600px !important}td.t102{width:800px !important}td.t100,td.t87,td.t91,td.t94,td.t97{width:600px !important}td.t112{width:800px !important}td.t105,td.t109{width:600px !important}td.t37,td.t41,td.t45,td.t49,td.t53{padding-left:10px !important;width:600px !important}
                        </style>
                        <![endif]-->
                        <!--[if mso]>
                        <xml>
                        <o:OfficeDocumentSettings>
                        <o:AllowPNG/>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                        </xml>
                        <![endif]-->
                        </head>
                        <body id="body" class="t172" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t171" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t170" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
                        <!--[if mso]>
                        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
                        <v:fill color="#242424"/>
                        </v:background>
                        <![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t120" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
                        <table class="t122" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t121" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t121" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t15" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
                        <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
                        <!--[if mso]>
                        <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
                        <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
                        <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t2" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
                        <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                        <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </div>
                        <!--[if mso]>
                        </td><td width="130" valign="top"><![endif]-->
                        <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
                        <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
                        </tr></table>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr></table>
                        <![endif]-->
                        </div></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
                        <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Se ha registrado un nuevo pago. PagoTotal ref: ${transaction.id}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                        <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">En la transaccion con identificador ${transaction.id} se ha registrado un nuevo pago. Por favor accede a la plataforma administrativa de Pago Total para que gestiones esta transaccion</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
                        <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
                        <a class="t26" href="https://dashboard.pagototal.net/transactions" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">IR A PAGO TOTAL</a></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t61" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t61" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
                        <div class="t60" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
                        <!--[if mso]>
                        <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t55" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
                        <div class="t59" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t58" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57"><tr>
                        <td class="t56"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t28" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
                        <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t33" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
                        <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">DESCRIPCION: </span>${transaction?.description}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t37" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
                        <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">IDENTIFICADOR: </span>${transaction?.id}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t41" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
                        <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span>${transaction?.client?.nombre}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t46" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t45" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t45" style="width:480px;"><![endif]-->
                        <h1 class="t44" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">METODO DE PAGO:</span> ${transaction?.globalMethod?.name}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t50" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t49" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t49" style="width:480px;"><![endif]-->
                        <h1 class="t48" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t47" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">MONTO:</span> ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</h1></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t54" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t53" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t53" style="width:480px;"><![endif]-->
                        <h1 class="t52" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t51" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA:</span> ${moment(transaction?.payment_date).format("DD/MM/YY")}</h1></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t55" style="width:10px;" width="10"></td>
                        </tr></table>
                        <![endif]-->
                        </div></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t63" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t119" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t118" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t118" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
                        <div class="t117" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
                        <!--[if mso]>
                        <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
                        <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
                        <td class="t82" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t80" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t65" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
                        <h1 class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">COMPRADOR</h1></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t67" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t69" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t69" style="width:480px;"><![endif]-->
                        <p class="t68" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t72" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t72" style="width:480px;"><![endif]-->
                        <p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t75" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
                        <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t78" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
                        <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        <!--[if !mso]><!--><div class="t84" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
                        <!--<![endif]-->
                        </div>
                        <!--[if mso]>
                        </td><td width="210" valign="top"><![endif]-->
                        <div class="t116" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t115"><tr>
                        <td class="t114"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t102" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t88" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t87" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t87" style="width:480px;"><![endif]-->
                        <h1 class="t86" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t89" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t92" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t91" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t91" style="width:480px;"><![endif]-->
                        <p class="t90" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t95" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t94" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t94" style="width:480px;"><![endif]-->
                        <p class="t93" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t98" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t97" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t97" style="width:480px;"><![endif]-->
                        <p class="t96" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t101" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t100" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t100" style="width:480px;"><![endif]-->
                        <p class="t99" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t113" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t112" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t112" style="width:480px;"><![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t105" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
                        <h1 class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">METODO DE PAGO</h1></td>
                        </tr></table>
                        </td></tr><tr><td><div class="t107" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                        <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t109" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t109" style="width:480px;"><![endif]-->
                        <p class="t108" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"> ${transaction?.globalMethod?.name}</p></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </div>
                        <!--[if mso]>
                        </td>
                        </tr></table>
                        <![endif]-->
                        </div></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t168" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t168" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                        <table class="t125" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t124" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t124" style="width:480px;"><![endif]-->
                        <p class="t123" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t158" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t157" style="width:480px;padding:10px 0 36px 0;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t157" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
                        <div class="t156" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
                        <!--[if mso]>
                        <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t127" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                        <div class="t131" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t130" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t129"><tr>
                        <td class="t128"><div style="font-size:0px;"><img class="t126" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t127" style="width:10px;" width="10"></td><td class="t133" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                        <div class="t137" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t136" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t135"><tr>
                        <td class="t134"><div style="font-size:0px;"><img class="t132" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t133" style="width:10px;" width="10"></td><td class="t139" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                        <div class="t143" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t142" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t141"><tr>
                        <td class="t140"><div style="font-size:0px;"><img class="t138" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t139" style="width:10px;" width="10"></td><td class="t145" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                        <div class="t149" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t148" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t147"><tr>
                        <td class="t146"><div style="font-size:0px;"><img class="t144" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t145" style="width:10px;" width="10"></td><td class="t151" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                        <div class="t155" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t154" style="padding:0 10px 0 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t153"><tr>
                        <td class="t152"><div style="font-size:0px;"><img class="t150" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
                        </tr></table>
                        </div></div>
                        <!--[if mso]>
                        </td><td class="t151" style="width:10px;" width="10"></td>
                        </tr></table>
                        <![endif]-->
                        </div></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t161" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t160" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t160" style="width:480px;"><![endif]-->
                        <p class="t159" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td>
                        </tr></table>
                        </td></tr><tr><td>
                        <table class="t167" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                        <!--[if !mso]><!--><td class="t166" style="width:480px;">
                        <!--<![endif]-->
                        <!--[if mso]><td class="t166" style="width:480px;"><![endif]-->
                        <p class="t165" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t162" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t163" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t164" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
                        </tr></table>
                        </td></tr></table></td>
                        </tr></table>
                        </td></tr></table></td></tr></table></div></body>
                        </html>
                    `
                }
    
    
                transporter.sendMail(mailAdministrationOne, (error, info) => {
                    if (error) {
                        console.log({ problem: "Error al enviar email ", error: error.message })
                    } else {
                        console.log("Email a administrador del cliente Enviado ")
                    }
                })
            }
        }

        res.status(200).json("Enviando mensajes...")

    } catch (error) {
        console.log({errorPayment: error.message})
        return res.status(404).json({error: error.message})
    }
})

// SE HA APROBADO EL PAGO 
mailRoute.post('/payment/state/:id/:state', async (req, res)=> {    
    try {

        const { id, state } = req.params
        var fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");


        const transaction = await Transaction.findByPk(id, { include: [PaymentMethod, GlobalMethod, Buyer, Client, Factura, User]})

        const { buyer_email } = transaction?.buyer


        if (!transaction) {
            console.log({error: "No existe esta transaccion"})
            return res.status(404).json({error: "No existe esta transaccion"})
        } else if (!buyer_email) {
            console.log({error: "El comprador no ha configurado su email"})
            return res.status(404).json({error: "El comprador no ha configurado su email"})        
        }

        let mailOptions = {
            from: mainEmail,
            to: buyer_email,
            // to: "humbale11@gmail.com",
            subject: "Su pago ha sido aprobado",
            text:"Su pago ha sido aprobado",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago ha sido aprobado</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">¡Hola ${transaction.buyer.buyer_name} ${transaction.buyer.buyer_lastName}!</p>
            //         <p style="font-size: 16px; color: #555;">Su pago ha sido aprobado por nuestro staff</p>
            //         <p style="font-size: 16px; color: #555;">Muchas gracias por usar nuestro servicio.</p>
            //         <hr style="border: 1px solid #ccc;">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen de la transacción</h1>
            //         <p><strong>Item:</strong> ${transaction?.description}</p>
            //         <p><strong>Identificador:</strong> ${transaction?.id}</p>
            //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
            //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
            //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
            //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
            //         ${
            //             transaction?.factura?.type == "Empresa" ? 
            //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
            //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
            //         }
            //         ${
            //             transaction?.factura?.type == "Empresa" ?
            //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
            //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
            //         }
            //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
            //     </div>
            // </div>
            // `
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t168{padding:48px 50px!important;width:500px!important}.t100,.t105,.t109,.t124,.t160,.t166,.t2,.t21,.t5,.t65,.t69,.t72,.t75,.t78,.t87,.t91,.t94,.t97{width:600px!important}.t157{padding-bottom:44px!important;width:800px!important}.t61{width:760px!important}.t102,.t112,.t15,.t80{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t59{max-width:820px!important}.t28,.t33,.t37,.t41,.t45,.t49,.t53{padding-left:10px!important;width:590px!important}.t118{width:520px!important}.t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t116,.t85{width:50%!important;max-width:800px!important}.t82{padding-bottom:0!important;padding-right:5px!important}.t114{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t168{padding:48px 50px!important;width:500px!important}.moz-text-html .t124{width:600px!important}.moz-text-html .t157{padding-bottom:44px!important;width:800px!important}.moz-text-html .t160,.moz-text-html .t166{width:600px!important}.moz-text-html .t61{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t59{max-width:820px!important}.moz-text-html .t33{padding-left:10px!important;width:590px!important}.moz-text-html .t118{width:520px!important}.moz-text-html .t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t85{width:50%!important;max-width:800px!important}.moz-text-html .t82{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t116{width:50%!important;max-width:800px!important}.moz-text-html .t114{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t80{width:800px!important}.moz-text-html .t65,.moz-text-html .t69,.moz-text-html .t72,.moz-text-html .t75,.moz-text-html .t78{width:600px!important}.moz-text-html .t102{width:800px!important}.moz-text-html .t100,.moz-text-html .t87,.moz-text-html .t91,.moz-text-html .t94,.moz-text-html .t97{width:600px!important}.moz-text-html .t112{width:800px!important}.moz-text-html .t105,.moz-text-html .t109{width:600px!important}.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t45,.moz-text-html .t49,.moz-text-html .t53{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t120{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t121{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t168{padding:48px 50px !important;width:600px !important}td.t124{width:600px !important}td.t157{padding-bottom:44px !important;width:800px !important}td.t160,td.t166{width:600px !important}td.t15,td.t61{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t59{max-width:820px !important}td.t33{padding-left:10px !important;width:600px !important}td.t118{width:600px !important}div.t84{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t85{width:50% !important;max-width:800px !important}td.t82{padding-bottom:0 !important;padding-right:5px !important}div.t116{width:50% !important;max-width:800px !important}td.t114{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t80{width:800px !important}td.t65,td.t69,td.t72,td.t75,td.t78{width:600px !important}td.t102{width:800px !important}td.t100,td.t87,td.t91,td.t94,td.t97{width:600px !important}td.t112{width:800px !important}td.t105,td.t109{width:600px !important}td.t37,td.t41,td.t45,td.t49,td.t53{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t172" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t171" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t170" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t120" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t122" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t121" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t121" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su pago ha sido aprobado. PagoTotal ref: ${transaction.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">¡Hola ${transaction.buyer.buyer_name} ${transaction.buyer.buyer_lastName}! Su pago ha sido aprobado por nuestro staff, muchas gracias por usar nuestro servicio.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t23" href="https://dashboard.pagototal.net/${id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">ver transaccion</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t60" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t55" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t59" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t58" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57"><tr>
            <td class="t56"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">DESCRIPCION: </span>${transaction?.description}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">IDENTIFICADOR: </span>${transaction?.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t41" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
            <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span>${transaction?.client?.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t46" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t45" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t45" style="width:480px;"><![endif]-->
            <h1 class="t44" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">METODO DE PAGO:</span> ${transaction?.globalMethod?.name}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t50" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t49" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t49" style="width:480px;"><![endif]-->
            <h1 class="t48" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t47" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">MONTO:</span> ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t54" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t53" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t53" style="width:480px;"><![endif]-->
            <h1 class="t52" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t51" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA:</span> ${moment(transaction?.payment_date).format("DD/MM/YY")}</h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t55" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t63" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t119" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t118" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t118" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t117" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
            <td class="t82" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t65" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
            <h1 class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">COMPRADOR</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t67" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t69" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t69" style="width:480px;"><![endif]-->
            <p class="t68" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t72" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t72" style="width:480px;"><![endif]-->
            <p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
            <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t78" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
            <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t84" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t116" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t115"><tr>
            <td class="t114"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t102" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t88" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t87" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t87" style="width:480px;"><![endif]-->
            <h1 class="t86" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t89" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t92" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t91" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t91" style="width:480px;"><![endif]-->
            <p class="t90" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t95" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t94" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t94" style="width:480px;"><![endif]-->
            <p class="t93" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t98" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t97" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t97" style="width:480px;"><![endif]-->
            <p class="t96" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t101" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t100" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t100" style="width:480px;"><![endif]-->
            <p class="t99" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t113" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t112" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t112" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t105" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
            <h1 class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">METODO DE PAGO</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t107" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t109" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t109" style="width:480px;"><![endif]-->
            <p class="t108" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"> ${transaction?.globalMethod?.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t168" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t168" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t125" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t124" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t124" style="width:480px;"><![endif]-->
            <p class="t123" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t158" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t157" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t157" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t156" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t127" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t131" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t130" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t129"><tr>
            <td class="t128"><div style="font-size:0px;"><img class="t126" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t127" style="width:10px;" width="10"></td><td class="t133" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t137" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t136" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t135"><tr>
            <td class="t134"><div style="font-size:0px;"><img class="t132" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t133" style="width:10px;" width="10"></td><td class="t139" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t143" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t142" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t141"><tr>
            <td class="t140"><div style="font-size:0px;"><img class="t138" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t139" style="width:10px;" width="10"></td><td class="t145" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t149" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t148" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t147"><tr>
            <td class="t146"><div style="font-size:0px;"><img class="t144" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t145" style="width:10px;" width="10"></td><td class="t151" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t155" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t154" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t153"><tr>
            <td class="t152"><div style="font-size:0px;"><img class="t150" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t151" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t161" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t160" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t160" style="width:480px;"><![endif]-->
            <p class="t159" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t167" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t166" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t166" style="width:480px;"><![endif]-->
            <p class="t165" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t162" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t163" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t164" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        let mailOptions2 = {
            from: mainEmail,
            to: buyer_email,
            // to: "humbale11@gmail.com",
            subject: "Su pago ha sido rechazado",
            text:"Su pago ha sido rechazado",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago ha sido rechazado</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">¡Hola ${transaction.buyer.buyer_name} ${transaction.buyer.buyer_lastName}!</p>
            //         <p style="font-size: 16px; color: #555;">Lamentablemente su pago ha sido rechazado por nuestro staff</p>
            //         <hr style="border: 1px solid #ccc;">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen de la transacción</h1>
            //         <p><strong>Item:</strong> ${transaction?.description}</p>
            //         <p><strong>Identificador:</strong> ${transaction?.id}</p>
            //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
            //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
            //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
            //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
            //         ${
            //             transaction?.factura?.type == "Empresa" ? 
            //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
            //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
            //         }
            //         ${
            //             transaction?.factura?.type == "Empresa" ?
            //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
            //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
            //         }
            //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
            //     </div>
            // </div>
            // `

            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t168{padding:48px 50px!important;width:500px!important}.t100,.t105,.t109,.t124,.t160,.t166,.t2,.t21,.t5,.t65,.t69,.t72,.t75,.t78,.t87,.t91,.t94,.t97{width:600px!important}.t157{padding-bottom:44px!important;width:800px!important}.t61{width:760px!important}.t102,.t112,.t15,.t80{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t59{max-width:820px!important}.t28,.t33,.t37,.t41,.t45,.t49,.t53{padding-left:10px!important;width:590px!important}.t118{width:520px!important}.t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t116,.t85{width:50%!important;max-width:800px!important}.t82{padding-bottom:0!important;padding-right:5px!important}.t114{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t120{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t121{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t168{padding:48px 50px!important;width:500px!important}.moz-text-html .t124{width:600px!important}.moz-text-html .t157{padding-bottom:44px!important;width:800px!important}.moz-text-html .t160,.moz-text-html .t166{width:600px!important}.moz-text-html .t61{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t59{max-width:820px!important}.moz-text-html .t33{padding-left:10px!important;width:590px!important}.moz-text-html .t118{width:520px!important}.moz-text-html .t84{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t85{width:50%!important;max-width:800px!important}.moz-text-html .t82{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t116{width:50%!important;max-width:800px!important}.moz-text-html .t114{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t80{width:800px!important}.moz-text-html .t65,.moz-text-html .t69,.moz-text-html .t72,.moz-text-html .t75,.moz-text-html .t78{width:600px!important}.moz-text-html .t102{width:800px!important}.moz-text-html .t100,.moz-text-html .t87,.moz-text-html .t91,.moz-text-html .t94,.moz-text-html .t97{width:600px!important}.moz-text-html .t112{width:800px!important}.moz-text-html .t105,.moz-text-html .t109{width:600px!important}.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t45,.moz-text-html .t49,.moz-text-html .t53{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t120{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t121{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t168{padding:48px 50px !important;width:600px !important}td.t124{width:600px !important}td.t157{padding-bottom:44px !important;width:800px !important}td.t160,td.t166{width:600px !important}td.t15,td.t61{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t59{max-width:820px !important}td.t33{padding-left:10px !important;width:600px !important}td.t118{width:600px !important}div.t84{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t85{width:50% !important;max-width:800px !important}td.t82{padding-bottom:0 !important;padding-right:5px !important}div.t116{width:50% !important;max-width:800px !important}td.t114{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t80{width:800px !important}td.t65,td.t69,td.t72,td.t75,td.t78{width:600px !important}td.t102{width:800px !important}td.t100,td.t87,td.t91,td.t94,td.t97{width:600px !important}td.t112{width:800px !important}td.t105,td.t109{width:600px !important}td.t37,td.t41,td.t45,td.t49,td.t53{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t172" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t171" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t170" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t120" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t122" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t121" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t121" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su pago ha sido rechazado. PagoTotal ref: ${transaction.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola ${transaction.buyer.buyer_name} ${transaction.buyer.buyer_lastName}. Su pago ha sido rechazado por nuestro staff, muchas gracias por usar nuestro servicio.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t23" href="https://dashboard.pagototal.net/${id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">ver transaccion</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t60" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t55" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t59" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t58" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t57"><tr>
            <td class="t56"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">DESCRIPCION: </span>${transaction?.description}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">IDENTIFICADOR: </span>${transaction?.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t41" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
            <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span>${transaction?.client?.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t46" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t45" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t45" style="width:480px;"><![endif]-->
            <h1 class="t44" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">METODO DE PAGO:</span> ${transaction?.globalMethod?.name}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t50" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t49" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t49" style="width:480px;"><![endif]-->
            <h1 class="t48" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t47" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">MONTO:</span> ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t54" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t53" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t53" style="width:480px;"><![endif]-->
            <h1 class="t52" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t51" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA:</span> ${moment(transaction?.payment_date).format("DD/MM/YY")}</h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t55" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t63" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t119" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t118" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t118" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t117" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
            <td class="t82" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t65" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
            <h1 class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">COMPRADOR</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t67" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t69" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t69" style="width:480px;"><![endif]-->
            <p class="t68" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t73" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t72" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t72" style="width:480px;"><![endif]-->
            <p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="width:480px;"><![endif]-->
            <p class="t74" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t78" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
            <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t84" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t116" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t115"><tr>
            <td class="t114"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t102" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t88" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t87" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t87" style="width:480px;"><![endif]-->
            <h1 class="t86" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t89" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t92" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t91" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t91" style="width:480px;"><![endif]-->
            <p class="t90" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t95" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t94" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t94" style="width:480px;"><![endif]-->
            <p class="t93" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t98" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t97" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t97" style="width:480px;"><![endif]-->
            <p class="t96" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t101" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t100" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t100" style="width:480px;"><![endif]-->
            <p class="t99" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t113" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t112" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t112" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t105" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
            <h1 class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">METODO DE PAGO</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t107" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t109" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t109" style="width:480px;"><![endif]-->
            <p class="t108" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"> ${transaction?.globalMethod?.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t168" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t168" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t125" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t124" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t124" style="width:480px;"><![endif]-->
            <p class="t123" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Want updates through more platforms?</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t158" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t157" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t157" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t156" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t127" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t131" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t130" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t129"><tr>
            <td class="t128"><div style="font-size:0px;"><img class="t126" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t127" style="width:10px;" width="10"></td><td class="t133" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t137" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t136" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t135"><tr>
            <td class="t134"><div style="font-size:0px;"><img class="t132" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t133" style="width:10px;" width="10"></td><td class="t139" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t143" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t142" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t141"><tr>
            <td class="t140"><div style="font-size:0px;"><img class="t138" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t139" style="width:10px;" width="10"></td><td class="t145" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t149" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t148" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t147"><tr>
            <td class="t146"><div style="font-size:0px;"><img class="t144" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t145" style="width:10px;" width="10"></td><td class="t151" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t155" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t154" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t153"><tr>
            <td class="t152"><div style="font-size:0px;"><img class="t150" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t151" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t161" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t160" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t160" style="width:480px;"><![endif]-->
            <p class="t159" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">4019 Waterview Lane, Santa Fe, NM, New Mexico 87500</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t167" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t166" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t166" style="width:480px;"><![endif]-->
            <p class="t165" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t162" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t163" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t164" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        let mailOptions3 = {
            from: mainEmail,
            to: buyer_email,
            // to: "humbale11@gmail.com",
            subject: "Su pago está pendiente por aprobación",
            text:"Su pago está pendiente por aprobación",
            // html: `
            // <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            //     <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Su pago está pendiente por aprobación</h1>
            //         <hr style="border: 1px solid #ccc;">
            //         <p style="font-size: 16px; color: #555;">¡Hola ${transaction.buyer.buyer_name} ${transaction.buyer.buyer_lastName}!</p>
            //         <p style="font-size: 16px; color: #555;">Hemos recibido la información de su pago y está en revisión. Usted recibirá un email cuando su pago sea aprobado o rechazado</p>
            //         <p style="font-size: 16px; color: #555;">Muchas gracias por usar nuestro servicio.</p>
            //         <hr style="border: 1px solid #ccc;">
            //         <h1 style="color: #333; font-size: 24px; text-align: center;">Resumen de la transacción</h1>
            //         <p><strong>Item:</strong> ${transaction?.description}</p>
            //         <p><strong>Identificador:</strong> ${transaction?.id}</p>
            //         <p><strong>Negocio:</strong> ${transaction?.client?.nombre}</p>
            //         <p><strong>Método de pago:</strong> ${(transaction?.globalMethod?.name)} </p>
            //         <p><strong>Monto:</strong> ${(transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)} ${transaction?.currency?.simbol}</p>
            //         <p><strong>Fecha:</strong> ${moment(transaction?.payment_date).format("DD/MM/YY")}</p>
            //         ${
            //             transaction?.factura?.type == "Empresa" ? 
            //             `<p><strong>Razon Social:</strong> ${transaction?.factura["invoice_razonSocial"]}</p>` :
            //             `<p><strong>Nombre:</strong> ${transaction?.factura?.invoice_name + " " + transaction?.factura?.invoice_lastName}</p>`
            //         }
            //         ${
            //             transaction?.factura?.type == "Empresa" ?
            //             `<p><strong>Rif:</strong> ${transaction?.factura?.invoice_rif}</p>` :
            //             `<p><strong>Documento:</strong> ${transaction?.factura?.invoice_document}</p>` 
            //         }
            //         <p><strong>Dirección:</strong> ${transaction?.factura?.invoice_country}, ${transaction?.factura?.invoice_state}, ${transaction?.factura?.invoice_city}</p>
            //     </div>
            // </div>
            // `
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t128{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t129{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t176{padding:48px 50px!important;width:500px!important}.t102,.t105,.t108,.t113,.t117,.t132,.t168,.t174,.t2,.t21,.t5,.t73,.t77,.t80,.t83,.t86,.t95,.t99{width:600px!important}.t165{padding-bottom:44px!important;width:800px!important}.t69{width:760px!important}.t110,.t120,.t15,.t88{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t67{max-width:813px!important}.t28,.t33,.t37,.t43,.t48,.t52,.t57,.t61{padding-left:10px!important;width:590px!important}.t126{width:520px!important}.t92{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.t124,.t93{width:50%!important;max-width:800px!important}.t90{padding-bottom:0!important;padding-right:5px!important}.t122{padding-left:5px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t128{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t129{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t176{padding:48px 50px!important;width:500px!important}.moz-text-html .t132{width:600px!important}.moz-text-html .t165{padding-bottom:44px!important;width:800px!important}.moz-text-html .t168,.moz-text-html .t174{width:600px!important}.moz-text-html .t69{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t67{max-width:813px!important}.moz-text-html .t33,.moz-text-html .t61{padding-left:10px!important;width:590px!important}.moz-text-html .t126{width:520px!important}.moz-text-html .t92{mso-line-height-alt:0px!important;line-height:0!important;display:none!important}.moz-text-html .t93{width:50%!important;max-width:800px!important}.moz-text-html .t90{padding-bottom:0!important;padding-right:5px!important}.moz-text-html .t124{width:50%!important;max-width:800px!important}.moz-text-html .t122{padding-left:5px!important}.moz-text-html .t28{padding-left:10px!important;width:590px!important}.moz-text-html .t88{width:800px!important}.moz-text-html .t73,.moz-text-html .t77,.moz-text-html .t80,.moz-text-html .t83,.moz-text-html .t86{width:600px!important}.moz-text-html .t110{width:800px!important}.moz-text-html .t102,.moz-text-html .t105,.moz-text-html .t108,.moz-text-html .t95,.moz-text-html .t99{width:600px!important}.moz-text-html .t120{width:800px!important}.moz-text-html .t113,.moz-text-html .t117{width:600px!important}.moz-text-html .t37,.moz-text-html .t43,.moz-text-html .t48,.moz-text-html .t52,.moz-text-html .t57{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t128{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t129{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t176{padding:48px 50px !important;width:600px !important}td.t132{width:600px !important}td.t165{padding-bottom:44px !important;width:800px !important}td.t168,td.t174{width:600px !important}td.t15,td.t69{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t67{max-width:813px !important}td.t33,td.t61{padding-left:10px !important;width:600px !important}td.t126{width:600px !important}div.t92{mso-line-height-alt:0px !important;line-height:0 !important;display:none !important}div.t93{width:50% !important;max-width:800px !important}td.t90{padding-bottom:0 !important;padding-right:5px !important}div.t124{width:50% !important;max-width:800px !important}td.t122{padding-left:5px !important}td.t28{padding-left:10px !important;width:600px !important}td.t88{width:800px !important}td.t73,td.t77,td.t80,td.t83,td.t86{width:600px !important}td.t110{width:800px !important}td.t102,td.t105,td.t108,td.t95,td.t99{width:600px !important}td.t120{width:800px !important}td.t113,td.t117{width:600px !important}td.t37,td.t43,td.t48,td.t52,td.t57{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t180" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t179" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t178" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t128" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t130" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t129" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t129" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/f88815fd-ab78-47a6-8908-346fb4a0fdd0.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Su pago esta pendiente. PagoTotal ref: ${transaction.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hemos recibido la información de su pago y estamos evaluandola, usted recibirá un email cuando su pago sea aprobado o rechazado. Muchas gracias por usar nuestro servicio.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t26" href="https://dashboard.pagototal.net/payment/${id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">VERIFICAR TRANSACCION</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t70" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t69" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t69" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t68" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t63" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t67" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t66" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t65"><tr>
            <td class="t64"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">resumen</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <p class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">descripcion:</span> ${transaction?.description}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">identificador:</span> ${transaction?.id}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t44" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t43" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t43" style="width:480px;"><![endif]-->
            <p class="t42" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">NEGOCIO: </span><span class="t41" style="margin:0;Margin:0;mso-line-height-rule:exactly;"><span class="t40" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${transaction?.client?.nombre}</span></span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t49" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t48" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t48" style="width:480px;"><![endif]-->
            <p class="t47" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t45" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Metodo de pago: </span><span class="t46" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${transaction?.globalMethod?.name}</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t53" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t52" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t52" style="width:480px;"><![endif]-->
            <p class="t51" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t50" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">mONTO: ${numeral((transaction?.totalValue*1) + ((transaction?.client?.iva / 100) * transaction?.gateway_fee)).format("0,0.00")} ${transaction?.currency?.simbol}</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t58" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t57" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t57" style="width:480px;"><![endif]-->
            <p class="t56" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t54" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">fecha: </span><span class="t55" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${moment(transaction?.payment_date).format("DD/MM/YY")}</span></p></td>
            </tr></table>
            </td></tr><tr><td><div class="t60" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t62" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t61" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t61" style="border-top:1px solid #CCCCCC;width:480px;padding:15px 0 0 0;"><![endif]-->
            <h1 class="t59" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"> </h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t63" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t71" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t127" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t126" style="background-color:#F0F0F0;width:400px;padding:40px 40px 40px 40px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t126" style="background-color:#F0F0F0;width:480px;padding:40px 40px 40px 40px;"><![endif]-->
            <div class="t125" style="display:inline-table;width:100%;text-align:left;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top" width="420"><tr><td width="210" valign="top"><![endif]-->
            <div class="t93" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t91"><tr>
            <td class="t90" style="padding:0 0 15px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t89" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t88" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t88" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t74" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t73" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t73" style="width:480px;"><![endif]-->
            <h1 class="t72" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Comprador</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t75" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t78" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t77" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t77" style="width:480px;"><![endif]-->
            <p class="t76" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_name}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t81" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t80" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t80" style="width:480px;"><![endif]-->
            <p class="t79" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_lastName}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t84" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t83" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t83" style="width:480px;"><![endif]-->
            <p class="t82" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_document}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t87" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t86" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t86" style="width:480px;"><![endif]-->
            <p class="t85" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_email}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            <!--[if !mso]><!--><div class="t92" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;</div>
            <!--<![endif]-->
            </div>
            <!--[if mso]>
            </td><td width="210" valign="top"><![endif]-->
            <div class="t124" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t123"><tr>
            <td class="t122"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t111" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t110" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t110" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t96" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t95" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t95" style="width:480px;"><![endif]-->
            <h1 class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">DIRECCIÓN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t97" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t100" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t99" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t99" style="width:480px;"><![endif]-->
            <p class="t98" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_country}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t103" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t102" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t102" style="width:480px;"><![endif]-->
            <p class="t101" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.buyer?.buyer_city}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t106" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t105" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t105" style="width:480px;"><![endif]-->
            <p class="t104" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction.buyer?.buyer_address}</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t109" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t108" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t108" style="width:480px;"><![endif]-->
            <p class="t107" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">&nbsp;</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td><div class="t119" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t121" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t120" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t120" style="width:480px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t114" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t113" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t113" style="width:480px;"><![endif]-->
            <h1 class="t112" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">metodo de pago</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t115" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t118" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t117" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t117" style="width:480px;"><![endif]-->
            <p class="t116" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#242424;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">${transaction?.globalMethod?.name}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t177" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t176" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t176" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t133" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t132" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t132" style="width:480px;"><![endif]-->
            <p class="t131" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t166" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t165" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t165" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t164" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t135" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t139" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t138" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t137"><tr>
            <td class="t136"><div style="font-size:0px;"><img class="t134" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/277e2851-d316-4579-9dd2-e286f8f4f5a9.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t135" style="width:10px;" width="10"></td><td class="t141" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t145" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t144" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t143"><tr>
            <td class="t142"><div style="font-size:0px;"><img class="t140" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/3abb9987-b18b-4380-912a-cb1d8c4327fd.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t141" style="width:10px;" width="10"></td><td class="t147" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t151" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t150" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t149"><tr>
            <td class="t148"><div style="font-size:0px;"><img class="t146" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/5614e7ae-d61a-4217-afc5-ee1f2a4b31fe.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t147" style="width:10px;" width="10"></td><td class="t153" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t157" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t156" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t155"><tr>
            <td class="t154"><div style="font-size:0px;"><img class="t152" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/db02c171-88b1-461b-a107-a9251460fe31.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t153" style="width:10px;" width="10"></td><td class="t159" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t163" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t162" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t161"><tr>
            <td class="t160"><div style="font-size:0px;"><img class="t158" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://bd52dc77-93b7-4545-9868-ad5053c1f27a.b-cdn.net/e/0a38d1cc-c577-42ea-9d32-356d4eef68cc/744145bd-a682-49f6-af3b-03ba2b7a44d5.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t159" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t169" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t168" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t168" style="width:480px;"><![endif]-->
            <p class="t167" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t175" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t174" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t174" style="width:480px;"><![endif]-->
            <p class="t173" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t170" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t171" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t172" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        if (state == 1 ) {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(404).json({ problem: "Error al enviar email ", error: error.message })
                } else {
                    res.status(200).json({success: "Se ha enviado el email a " + buyer_email})
                }
            })
        } else if (state == 2) {
            transporter.sendMail(mailOptions2, (error, info) => {
                if (error) {
                    res.status(404).json({ problem: "Error al enviar email ", error: error.message })
                } else {
                    res.status(200).json({success: "Se ha enviado el email a " + buyer_email})
                }
            })
        } else if (state == 3) {
            transporter.sendMail(mailOptions3, (error, info) => {
                if (error) {
                    res.status(404).json({ problem: "Error al enviar email ", error: error.message })
                } else {
                    res.status(200).json({success: "Se ha enviado el email a " + buyer_email})
                }
            })
        } else {
            res.status(404).json({error: "No ha enviado un estado válido"})
        }

    } catch (error) {
        return res.status(404).json({error: error.message})
    }
})

// SOLICITUD DE RETIRO DE DINERO
mailRoute.post("/withdrawal/:id", async (req, res) => {
    try {
        const { id } = req.params
        let fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");
        let adminEmail1 = "inscripcionespukiebook@gmail.com"
        // let adminEmail1 = "humbale11@gmail.com"
        let adminEmail2 = "pagos@pukiebook.com"
        // let adminEmail2 = "humbale11@gmail.com"

        const withdrawal = await Withdrawal.findByPk(id)


        if (!withdrawal) {
            return res.status(404).json({error: "No existe el retiro"})
        }

        const client = await Client.findByPk(withdrawal.clientId)

        if (!client) {
            return res.status(404).json({error: "No existe el retiro"})
        }

        let mailOptions1 = {
            from: mainEmail,
            to: adminEmail1,
            subject: `Nueva solicitud de retiro de ${client.nombre}`,
            text: `Nueva solicitud de retiro de ${client.nombre}`,            
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t74{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t75{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t122{padding:48px 50px!important;width:500px!important}.t114,.t120,.t2,.t21,.t5,.t78{width:600px!important}.t111{padding-bottom:44px!important;width:800px!important}.t71{width:760px!important}.t15{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t69{max-width:820px!important}.t28,.t33,.t37,.t41,.t46,.t50,.t54,.t59,.t63{padding-left:10px!important;width:590px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t74{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t75{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t122{padding:48px 50px!important;width:500px!important}.moz-text-html .t78{width:600px!important}.moz-text-html .t111{padding-bottom:44px!important;width:800px!important}.moz-text-html .t114,.moz-text-html .t120{width:600px!important}.moz-text-html .t71{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t69{max-width:820px!important}.moz-text-html .t28,.moz-text-html .t33,.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t46,.moz-text-html .t50,.moz-text-html .t54,.moz-text-html .t59,.moz-text-html .t63{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t74{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t75{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t122{padding:48px 50px !important;width:600px !important}td.t78{width:600px !important}td.t111{padding-bottom:44px !important;width:800px !important}td.t114,td.t120{width:600px !important}td.t15,td.t71{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t69{max-width:820px !important}td.t28,td.t33,td.t37,td.t41,td.t46,td.t50,td.t54,td.t59,td.t63{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t126" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t125" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t124" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t74" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Solicitud de retiro pendiente</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola. el cliente ${client.nombre} ha creado una nueva solicitud de retiro por un monto de ${numeral(withdrawal.amount).format("0,0.00")} ${withdrawal.currency}. Accede a la plataforma administrativa para gestionar esta solicitud.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t23" href="https://dashboard.pagototal.net/withdrawals" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">ver retiro</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t72" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t71" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t71" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t70" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t65" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t69" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t68" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t67"><tr>
            <td class="t66"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Cliente: </span>${client.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Identificador: </span>${client?.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t41" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
            <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Identificador del retiro:</span> ${withdrawal.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t47" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t46" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t46" style="width:480px;"><![endif]-->
            <h1 class="t45" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Estado: </span><span class="t44" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">pENDIENTE POR APROBACION</span></h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t51" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t50" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t50" style="width:480px;"><![endif]-->
            <h1 class="t49" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t48" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Saldo solicitado: </span>${numeral(withdrawal.amount).format("0,0.00")} ${withdrawal.currency}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t55" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t54" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t54" style="width:480px;"><![endif]-->
            <h1 class="t53" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t52" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">Saldo del cliente:</span> ${numeral(withdrawal.previous_balance).format("0,0.00")} ${withdrawal.currency}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t60" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t59" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t59" style="width:480px;"><![endif]-->
            <h1 class="t58" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t56" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA: </span><span class="t57" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${moment(withdrawal.date).format("YYYY-MM-DD HH:MM:SS")}</span></h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t64" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t63" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t63" style="width:480px;"><![endif]-->
            <h1 class="t62" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t61" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">&nbsp;</span></h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t65" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t73" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t123" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t122" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t122" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t78" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
            <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t112" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t111" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t111" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t110" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t81" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t84" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
            <td class="t82"><div style="font-size:0px;"><img class="t80" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t81" style="width:10px;" width="10"></td><td class="t87" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t91" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t90" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t89"><tr>
            <td class="t88"><div style="font-size:0px;"><img class="t86" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t87" style="width:10px;" width="10"></td><td class="t93" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t97" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t96" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t95"><tr>
            <td class="t94"><div style="font-size:0px;"><img class="t92" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t93" style="width:10px;" width="10"></td><td class="t99" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t103" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t102" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101"><tr>
            <td class="t100"><div style="font-size:0px;"><img class="t98" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t99" style="width:10px;" width="10"></td><td class="t105" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t109" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t108" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t107"><tr>
            <td class="t106"><div style="font-size:0px;"><img class="t104" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t105" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t115" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t114" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t114" style="width:480px;"><![endif]-->
            <p class="t113" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t121" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t120" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t120" style="width:480px;"><![endif]-->
            <p class="t119" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t116" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t117" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t118" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        let mailOptions2 = {
            from: mainEmail,
            to: adminEmail2,
            subject: `Nueva solicitud de retiro de ${client.nombre}`,
            text: `Nueva solicitud de retiro de ${client.nombre}`,            
            html: `
            <!--
            * This email was built using Tabular.
            * For more information, visit https://tabular.email
            -->
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <title></title>
            <meta charset="UTF-8" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--<![endif]-->
            <meta name="x-apple-disable-message-reformatting" content="" />
            <meta content="target-densitydpi=device-dpi" name="viewport" />
            <meta content="true" name="HandheldFriendly" />
            <meta content="width=device-width" name="viewport" />
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
            <style type="text/css">
            table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
            }
            table td {
            border-collapse: collapse
            }
            .ExternalClass {
            width: 100%
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
            line-height: 100%
            }
            body, a, li, p, h1, h2, h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            }
            html {
            -webkit-text-size-adjust: none !important
            }
            body, #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
            }
            #innerTable img+div {
            display: none;
            display: none !important
            }
            img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
            }
            h1, h2, h3, p, a {
            line-height: 1;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
            }
            a {
            text-decoration: none
            }
            h1, h2, h3, p {
            min-width: 100%!important;
            width: 100%!important;
            max-width: 100%!important;
            display: inline-block!important;
            border: 0;
            padding: 0;
            margin: 0
            }
            a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
            }
            u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
            }
            a[href^="mailto"],
            a[href^="tel"],
            a[href^="sms"] {
            color: inherit;
            text-decoration: none
            }
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            .hd { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (max-width: 480px) {
            .hm { display: none!important }
            }
            </style>
            <style type="text/css">
            @media (min-width: 481px) {
            h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t74{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t75{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t122{padding:48px 50px!important;width:500px!important}.t114,.t120,.t2,.t21,.t5,.t78{width:600px!important}.t111{padding-bottom:44px!important;width:800px!important}.t71{width:760px!important}.t15{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t69{max-width:820px!important}.t28,.t33,.t37,.t41,.t46,.t50,.t54,.t59,.t63{padding-left:10px!important;width:590px!important}
            }
            </style>
            <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t74{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t75{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t122{padding:48px 50px!important;width:500px!important}.moz-text-html .t78{width:600px!important}.moz-text-html .t111{padding-bottom:44px!important;width:800px!important}.moz-text-html .t114,.moz-text-html .t120{width:600px!important}.moz-text-html .t71{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t69{max-width:820px!important}.moz-text-html .t28,.moz-text-html .t33,.moz-text-html .t37,.moz-text-html .t41,.moz-text-html .t46,.moz-text-html .t50,.moz-text-html .t54,.moz-text-html .t59,.moz-text-html .t63{padding-left:10px!important;width:590px!important}</style>
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
            <!--<![endif]-->
            <!--[if mso]>
            <style type="text/css">
            img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t74{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t75{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t122{padding:48px 50px !important;width:600px !important}td.t78{width:600px !important}td.t111{padding-bottom:44px !important;width:800px !important}td.t114,td.t120{width:600px !important}td.t15,td.t71{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t69{max-width:820px !important}td.t28,td.t33,td.t37,td.t41,td.t46,td.t50,td.t54,td.t59,td.t63{padding-left:10px !important;width:600px !important}
            </style>
            <![endif]-->
            <!--[if mso]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            </head>
            <body id="body" class="t126" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t125" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t124" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
            <!--[if mso]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
            <v:fill color="#242424"/>
            </v:background>
            <![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t74" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
            <table class="t76" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t75" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t75" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t15" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
            <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
            <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
            <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t2" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
            <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td><td width="130" valign="top"><![endif]-->
            <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
            <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/252e67fa-2e6b-4336-8967-486722b3d6c4.jpeg"/></div></td>
            </tr></table>
            </div>
            <!--[if mso]>
            </td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
            <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Solicitud de retiro pendiente</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
            <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola. el cliente ${client.nombre} ha creado una nueva solicitud de retiro por un monto de ${numeral(withdrawal.amount).format("0,0.00")}. Accede a la plataforma administrativa para gestionar esta solicitud.</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
            <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
            <a class="t23" href="https://dashboard.pagototal.net/withdrawals" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">ver retiro</a></td>
            </tr></table>
            </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t72" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t71" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t71" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
            <div class="t70" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t65" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
            <div class="t69" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t68" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t67"><tr>
            <td class="t66"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t28" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
            <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">RESUMEN</h1></td>
            </tr></table>
            </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
            <table class="t34" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t33" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t33" style="width:480px;"><![endif]-->
            <h1 class="t32" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t31" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">cliente: </span>${client.nombre}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t38" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t37" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t37" style="width:480px;"><![endif]-->
            <h1 class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t35" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">IDENTIFICADOR: </span>${client?.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t41" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
            <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t39" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">idENTIFICADOR DE RETIRO:</span> ${withdrawal.id}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t47" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t46" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t46" style="width:480px;"><![endif]-->
            <h1 class="t45" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t43" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">eSTADO: </span><span class="t44" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">pENDIENTE POR APROBACION</span></h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t51" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t50" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t50" style="width:480px;"><![endif]-->
            <h1 class="t49" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t48" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">saldo solicitado: </span>${numeral(withdrawal.amount).format("0,0.00")} ${withdrawal.currency}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t55" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t54" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t54" style="width:480px;"><![endif]-->
            <h1 class="t53" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t52" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">saldo del cliente:</span> ${numeral(withdrawal.previous_balance).format("0,0.00")} ${withdrawal.currency}</h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t60" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t59" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t59" style="width:480px;"><![endif]-->
            <h1 class="t58" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t56" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">FECHA: </span><span class="t57" style="margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly;">${moment(withdrawal.date).format("YYYY-MM-DD HH:MM:SS")}</span></h1></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t64" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t63" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t63" style="width:480px;"><![endif]-->
            <h1 class="t62" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"><span class="t61" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">&nbsp;</span></h1></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t65" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td><div class="t73" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t123" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t122" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t122" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
            <table class="t79" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t78" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t78" style="width:480px;"><![endif]-->
            <p class="t77" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t112" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t111" style="width:480px;padding:10px 0 36px 0;">
            <!--<![endif]-->
            <!--[if mso]><td class="t111" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
            <div class="t110" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t81" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t85" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t84" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t83"><tr>
            <td class="t82"><div style="font-size:0px;"><img class="t80" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/8f7a58bb-ef9d-4cc9-a61e-0e1e66ad757c.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t81" style="width:10px;" width="10"></td><td class="t87" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t91" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t90" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t89"><tr>
            <td class="t88"><div style="font-size:0px;"><img class="t86" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/e0fa74aa-1516-4654-8a73-0ecfebd6792b.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t87" style="width:10px;" width="10"></td><td class="t93" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t97" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t96" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t95"><tr>
            <td class="t94"><div style="font-size:0px;"><img class="t92" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/d0ec1dd6-5e03-45c0-8955-39a921e6da02.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t93" style="width:10px;" width="10"></td><td class="t99" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t103" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t102" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101"><tr>
            <td class="t100"><div style="font-size:0px;"><img class="t98" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/b717ec72-da75-4ad8-9de4-b9abbd47bd9e.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t99" style="width:10px;" width="10"></td><td class="t105" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
            <div class="t109" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t108" style="padding:0 10px 0 10px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t107"><tr>
            <td class="t106"><div style="font-size:0px;"><img class="t104" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://f6e26ed5-2357-47c9-b65a-3517e434648b.b-cdn.net/e/108d04a5-fa9c-4394-aa5e-f451b3315005/58f567d3-c3bf-4239-87f3-da515d835640.png"/></div></td>
            </tr></table>
            </div></div>
            <!--[if mso]>
            </td><td class="t105" style="width:10px;" width="10"></td>
            </tr></table>
            <![endif]-->
            </div></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t115" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t114" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t114" style="width:480px;"><![endif]-->
            <p class="t113" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
            </tr></table>
            </td></tr><tr><td>
            <table class="t121" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <!--[if !mso]><!--><td class="t120" style="width:480px;">
            <!--<![endif]-->
            <!--[if mso]><td class="t120" style="width:480px;"><![endif]-->
            <p class="t119" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t116" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t117" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t118" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
            </tr></table>
            </td></tr></table></td>
            </tr></table>
            </td></tr></table></td></tr></table></div></body>
            </html>
            `
        }

        transporter.sendMail(mailOptions1, (error, info) => {
            if (error) {
                console.log("Error al enviar email de retiro a " + adminEmail1 + "-" + error.message)
                return res.status(404).json({error: "Error al enviar email"})
            } else {
                console.log("Se ha enviado email con solicitud de retiro a " + adminEmail1)                
                transporter.sendMail(mailOptions2, (error, info) => {
                    if (error) {
                        console.log("Error al enviar email de retiro a " + adminEmail2 + "-" + error.message)
                        return res.status(404).json({error: "Error al enviar email"})
                    } else {
                        console.log("Se ha enviado email con solicitud de retiro a " + adminEmail2)
                        return res.status(200).json({success: "Emails enviados"})
                        
                    }
                })
            }
        })

    } catch (error) {
        return res.status(500).json({error: error.message})
    }
})

// SOLICITUD DE RETIRO APROBADA

mailRoute.post("/withdrawalstate/:id/:state", async (req, res) => {
    try {
        const { id, state } = req.params
        let fechaActual = moment().format("YYYY-MM-DD HH:mm:ss");
        let adminEmail1 = "inscripcionespukiebook@gmail.com"
        // let adminEmail1 = "humbale11@gmail.com"
        let adminEmail2 = "pagos@pukiebook.com"
        // let adminEmail2 = "humbale11@gmail.com"

        const withdrawal = await Withdrawal.findByPk(id)


        if (!withdrawal) {
            return res.status(404).json({error: "No existe el retiro"})
        }

        const client = await Client.findByPk(withdrawal.clientId)

        if (!client) {
            return res.status(404).json({error: "No existe el retiro"})
        }

        if (state == "1") {

            let mailOptions1 = {
                from: mainEmail,
                to: client.email,
                subject: `Se ha aprobado tu solicitud de retiro`,
                text: `Se ha aprobado tu solicitud de retiro`,            
                html: `
                <!--
                * This email was built using Tabular.
                * For more information, visit https://tabular.email
                -->
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                <head>
                <title></title>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <!--<![endif]-->
                <meta name="x-apple-disable-message-reformatting" content="" />
                <meta content="target-densitydpi=device-dpi" name="viewport" />
                <meta content="true" name="HandheldFriendly" />
                <meta content="width=device-width" name="viewport" />
                <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
                <style type="text/css">
                table {
                border-collapse: separate;
                table-layout: fixed;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt
                }
                table td {
                border-collapse: collapse
                }
                .ExternalClass {
                width: 100%
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                line-height: 100%
                }
                body, a, li, p, h1, h2, h3 {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
                }
                html {
                -webkit-text-size-adjust: none !important
                }
                body, #innerTable {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale
                }
                #innerTable img+div {
                display: none;
                display: none !important
                }
                img {
                Margin: 0;
                padding: 0;
                -ms-interpolation-mode: bicubic
                }
                h1, h2, h3, p, a {
                line-height: 1;
                overflow-wrap: normal;
                white-space: normal;
                word-break: break-word
                }
                a {
                text-decoration: none
                }
                h1, h2, h3, p {
                min-width: 100%!important;
                width: 100%!important;
                max-width: 100%!important;
                display: inline-block!important;
                border: 0;
                padding: 0;
                margin: 0
                }
                a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important
                }
                u + #body a {
                color: inherit;
                text-decoration: none;
                font-size: inherit;
                font-family: inherit;
                font-weight: inherit;
                line-height: inherit;
                }
                a[href^="mailto"],
                a[href^="tel"],
                a[href^="sms"] {
                color: inherit;
                text-decoration: none
                }
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                .hd { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (max-width: 480px) {
                .hm { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t61{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t62{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t109{padding:48px 50px!important;width:500px!important}.t101,.t107,.t2,.t21,.t5,.t65{width:600px!important}.t98{padding-bottom:44px!important;width:800px!important}.t58{width:760px!important}.t15{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t56{max-width:820px!important}.t28,.t32,.t35,.t38,.t41,.t44,.t47,.t50{padding-left:10px!important;width:590px!important}
                }
                </style>
                <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t61{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t62{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t109{padding:48px 50px!important;width:500px!important}.moz-text-html .t65{width:600px!important}.moz-text-html .t98{padding-bottom:44px!important;width:800px!important}.moz-text-html .t101,.moz-text-html .t107{width:600px!important}.moz-text-html .t58{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t56{max-width:820px!important}.moz-text-html .t28,.moz-text-html .t32,.moz-text-html .t35,.moz-text-html .t38,.moz-text-html .t41,.moz-text-html .t44,.moz-text-html .t47,.moz-text-html .t50{padding-left:10px!important;width:590px!important}</style>
                <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
                <!--<![endif]-->
                <!--[if mso]>
                <style type="text/css">
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t61{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t62{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t109{padding:48px 50px !important;width:600px !important}td.t65{width:600px !important}td.t98{padding-bottom:44px !important;width:800px !important}td.t101,td.t107{width:600px !important}td.t15,td.t58{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t56{max-width:820px !important}td.t28,td.t32,td.t35,td.t38,td.t41,td.t44,td.t47,td.t50{padding-left:10px !important;width:600px !important}
                </style>
                <![endif]-->
                <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                </head>
                <body id="body" class="t113" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t112" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t111" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
                <!--[if mso]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
                <v:fill color="#242424"/>
                </v:background>
                <![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t61" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
                <table class="t63" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t62" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t62" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t15" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
                <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
                <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
                <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t2" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
                <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td><td width="130" valign="top"><![endif]-->
                <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
                <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/a354c6e6-a45d-453f-b6a9-0a5dd33fc3a0.jpeg"/></div></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
                <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Se ha aprobado tu solicitud de retiro</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola. ${client.nombre} Su solicitud de retiro #${withdrawal.id} ha sido aprobada. Accede a la plataforma administrativa para ver mas detalles del pago</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
                <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
                <a class="t23" href="https://dashboard.pagototal.net/wallet/${client.id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">Ver retiros</a></td>
                </tr></table>
                </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                <table class="t59" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t58" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t58" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
                <div class="t57" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t52" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
                <div class="t56" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t55" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t54"><tr>
                <td class="t53"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t28" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
                <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Resumen</h1></td>
                </tr></table>
                </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                <table class="t33" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t32" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t32" style="width:480px;"><![endif]-->
                <h1 class="t31" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">CLIENTE: ${client.nombre}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t36" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t35" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t35" style="width:480px;"><![endif]-->
                <h1 class="t34" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">IDENTIFICADOR: ${client?.id}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t39" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t38" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t38" style="width:480px;"><![endif]-->
                <h1 class="t37" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">IDENTIFICADOR DE RETIRO: ${withdrawal.id}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t41" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
                <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">ESTADO: APROBADO</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t45" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t44" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t44" style="width:480px;"><![endif]-->
                <h1 class="t43" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">SALDO SOLICITADO: ${numeral(withdrawal.amount).format("0,0.00")} ${withdrawal.currency}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t48" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t47" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t47" style="width:480px;"><![endif]-->
                <h1 class="t46" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">SALDO DEL CLIENTE: ${numeral(withdrawal.previous_balance).format("0,0.00")} ${withdrawal.currency}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t51" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t50" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t50" style="width:480px;"><![endif]-->
                <h1 class="t49" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">FECHA: ${moment(withdrawal.date).format("YYYY-MM-DD HH:MM:SS")}</h1></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t52" style="width:10px;" width="10"></td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td><div class="t60" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t109" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t109" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t65" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
                <p class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t99" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t98" style="width:480px;padding:10px 0 36px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t98" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
                <div class="t97" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t68" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t72" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t71" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t70"><tr>
                <td class="t69"><div style="font-size:0px;"><img class="t67" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/cbdb45c0-ee1d-4155-9fbb-e4a607707ddd.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t68" style="width:10px;" width="10"></td><td class="t74" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t78" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t77" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t76"><tr>
                <td class="t75"><div style="font-size:0px;"><img class="t73" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/69210f45-1032-40bc-b4a4-5f47a6d4bae8.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t74" style="width:10px;" width="10"></td><td class="t80" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t84" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t83" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t82"><tr>
                <td class="t81"><div style="font-size:0px;"><img class="t79" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/1e151238-2d70-494f-a821-482a1d9c4b15.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t80" style="width:10px;" width="10"></td><td class="t86" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t90" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t89" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t88"><tr>
                <td class="t87"><div style="font-size:0px;"><img class="t85" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/fec5285e-dae3-4529-92c3-e3d6b838d93d.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t86" style="width:10px;" width="10"></td><td class="t92" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t96" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t95" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t94"><tr>
                <td class="t93"><div style="font-size:0px;"><img class="t91" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/42d7617e-c6f4-45ab-a6de-f3fa751a49fb.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t92" style="width:10px;" width="10"></td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t102" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t101" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t101" style="width:480px;"><![endif]-->
                <p class="t100" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t108" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t107" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t107" style="width:480px;"><![endif]-->
                <p class="t106" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t103" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t104" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t105" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </td></tr></table></td></tr></table></div></body>
                </html>
                `
            }
    
            transporter.sendMail(mailOptions1, (error, info) => {
                if (error) {
                    res.status(404).json({error: "Error al enviar email de retiro a " + client.email + "-" + error.message})
                    
                } else {
                    res.status(404).json({success: "Se ha enviado email con solicitud de retiro a " + client.email})                
                }
            })
        } else if (state == "2") {

            let mailOptions1 = {
                from: mainEmail,
                to: client.email,
                subject: `Se ha rechazado tu solicitud de retiro`,
                text: `Se ha rechazado tu solicitud de retiro`,            
                html: `
                <!--
                * This email was built using Tabular.
                * For more information, visit https://tabular.email
                -->
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                <head>
                <title></title>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <!--[if !mso]><!-->
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <!--<![endif]-->
                <meta name="x-apple-disable-message-reformatting" content="" />
                <meta content="target-densitydpi=device-dpi" name="viewport" />
                <meta content="true" name="HandheldFriendly" />
                <meta content="width=device-width" name="viewport" />
                <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
                <style type="text/css">
                table {
                border-collapse: separate;
                table-layout: fixed;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt
                }
                table td {
                border-collapse: collapse
                }
                .ExternalClass {
                width: 100%
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                line-height: 100%
                }
                body, a, li, p, h1, h2, h3 {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
                }
                html {
                -webkit-text-size-adjust: none !important
                }
                body, #innerTable {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale
                }
                #innerTable img+div {
                display: none;
                display: none !important
                }
                img {
                Margin: 0;
                padding: 0;
                -ms-interpolation-mode: bicubic
                }
                h1, h2, h3, p, a {
                line-height: 1;
                overflow-wrap: normal;
                white-space: normal;
                word-break: break-word
                }
                a {
                text-decoration: none
                }
                h1, h2, h3, p {
                min-width: 100%!important;
                width: 100%!important;
                max-width: 100%!important;
                display: inline-block!important;
                border: 0;
                padding: 0;
                margin: 0
                }
                a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important
                }
                u + #body a {
                color: inherit;
                text-decoration: none;
                font-size: inherit;
                font-family: inherit;
                font-weight: inherit;
                line-height: inherit;
                }
                a[href^="mailto"],
                a[href^="tel"],
                a[href^="sms"] {
                color: inherit;
                text-decoration: none
                }
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                .hd { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (max-width: 480px) {
                .hm { display: none!important }
                }
                </style>
                <style type="text/css">
                @media (min-width: 481px) {
                h1,img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;text-align:center}img,p{line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;mso-line-height-rule:exactly;mso-text-raise:2px}h1{line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;mso-line-height-rule:exactly;mso-text-raise:1px}h2,h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;font-weight:400;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{line-height:30px;font-size:24px}h3{line-height:26px;font-size:20px}.t61{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.t62{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.t18{padding-bottom:15px!important;width:600px!important}.t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.t109{padding:48px 50px!important;width:500px!important}.t101,.t107,.t2,.t21,.t5,.t65{width:600px!important}.t98{padding-bottom:44px!important;width:800px!important}.t58{width:760px!important}.t15{width:800px!important}.t13{width:26%!important;max-width:130px!important}.t11{padding-bottom:60px!important}.t9{width:74%!important}.t24{width:250px!important}.t56{max-width:820px!important}.t28,.t32,.t35,.t38,.t41,.t44,.t47,.t50{padding-left:10px!important;width:590px!important}
                }
                </style>
                <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t61{mso-line-height-alt:45px!important;line-height:45px!important;display:block!important}.moz-text-html .t62{padding-left:50px!important;padding-bottom:60px!important;padding-right:50px!important;width:500px!important}.moz-text-html .t18{padding-bottom:15px!important;width:600px!important}.moz-text-html .t17{line-height:26px!important;font-size:24px!important;letter-spacing:-1.56px!important}.moz-text-html .t109{padding:48px 50px!important;width:500px!important}.moz-text-html .t65{width:600px!important}.moz-text-html .t98{padding-bottom:44px!important;width:800px!important}.moz-text-html .t101,.moz-text-html .t107{width:600px!important}.moz-text-html .t58{width:760px!important}.moz-text-html .t15{width:800px!important}.moz-text-html .t13{width:26%!important;max-width:130px!important}.moz-text-html .t11{padding-bottom:60px!important}.moz-text-html .t9{width:74%!important}.moz-text-html .t2,.moz-text-html .t21,.moz-text-html .t5{width:600px!important}.moz-text-html .t24{width:250px!important}.moz-text-html .t56{max-width:820px!important}.moz-text-html .t28,.moz-text-html .t32,.moz-text-html .t35,.moz-text-html .t38,.moz-text-html .t41,.moz-text-html .t44,.moz-text-html .t47,.moz-text-html .t50{padding-left:10px!important;width:590px!important}</style>
                <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
                <!--<![endif]-->
                <!--[if mso]>
                <style type="text/css">
                img,p{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-.56px;direction:ltr;color:#333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px}h1{margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}div.t61{mso-line-height-alt:45px !important;line-height:45px !important;display:block !important}td.t62{padding-left:50px !important;padding-bottom:60px !important;padding-right:50px !important;width:600px !important}td.t18{padding-bottom:15px !important;width:600px !important}h1.t17{line-height:26px !important;font-size:24px !important;letter-spacing:-1.56px !important}td.t109{padding:48px 50px !important;width:600px !important}td.t65{width:600px !important}td.t98{padding-bottom:44px !important;width:800px !important}td.t101,td.t107{width:600px !important}td.t15,td.t58{width:800px !important}div.t13{width:26% !important;max-width:130px !important}td.t11{padding-bottom:60px !important}div.t9{width:74% !important}td.t2,td.t21,td.t5{width:600px !important}td.t24{width:250px !important}div.t56{max-width:820px !important}td.t28,td.t32,td.t35,td.t38,td.t41,td.t44,td.t47,td.t50{padding-left:10px !important;width:600px !important}
                </style>
                <![endif]-->
                <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
                </head>
                <body id="body" class="t113" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;"><div class="t112" style="background-color:#242424;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t111" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;" valign="top" align="center">
                <!--[if mso]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
                <v:fill color="#242424"/>
                </v:background>
                <![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td><div class="t61" style="mso-line-height-rule:exactly;font-size:1px;display:none;">&nbsp;</div></td></tr><tr><td>
                <table class="t63" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t62" style="background-color:#F8F8F8;width:420px;padding:0 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t62" style="background-color:#F8F8F8;width:480px;padding:0 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t16" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t15" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t15" style="width:480px;"><![endif]-->
                <div class="t14" style="display:inline-table;width:100%;text-align:right;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="right" valign="top" width="500"><tr><td width="370" valign="top"><![endif]-->
                <div class="t9" style="display:inline-table;text-align:initial;vertical-align:inherit;width:82.22222%;max-width:370px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t8"><tr>
                <td class="t7" style="padding:35px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t3" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t2" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t2" style="width:480px;"><![endif]-->
                <p class="t1" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t0" style="margin:0;Margin:0;font-weight:bold;mso-line-height-rule:exactly;">Pago Total</span></p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t6" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t5" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t5" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t4" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Date: ${fechaActual}</p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td><td width="130" valign="top"><![endif]-->
                <div class="t13" style="display:inline-table;text-align:initial;vertical-align:inherit;width:17.77778%;max-width:80px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t12"><tr>
                <td class="t11" style="padding:0 0 50px 0;"><div style="font-size:0px;"><img class="t10" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="130" height="130" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/a354c6e6-a45d-453f-b6a9-0a5dd33fc3a0.jpeg"/></div></td>
                </tr></table>
                </div>
                <!--[if mso]>
                </td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t18" style="width:480px;padding:0 0 20px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t18" style="width:480px;padding:0 0 20px 0;"><![endif]-->
                <h1 class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:800;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-1.04px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Se ha rechazado tu solicitud de retiro</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t22" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t21" style="width:480px;padding:0 0 22px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t21" style="width:480px;padding:0 0 22px 0;"><![endif]-->
                <p class="t20" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hola. ${client.nombre} Su solicitud de retiro #${withdrawal.id} ha sido rechazada. Accede a la plataforma administrativa para ver mas detalles</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t25" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
                <!--[if !mso]><!--><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t24" style="background-color:#181818;overflow:hidden;width:353px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;"><![endif]-->
                <a class="t23" href="https://dashboard.pagototal.net/wallet/${client.id}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">Ver retiros</a></td>
                </tr></table>
                </td></tr><tr><td><div class="t26" style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                <table class="t59" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t58" style="background-color:#F0F0F0;width:440px;padding:20px 20px 20px 20px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t58" style="background-color:#F0F0F0;width:480px;padding:20px 20px 20px 20px;"><![endif]-->
                <div class="t57" style="display:inline-table;width:100%;text-align:left;vertical-align:middle;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle" width="460"><tr><td class="t52" style="width:10px;" width="10"></td><td width="440" valign="middle"><![endif]-->
                <div class="t56" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:500px;"><div class="t55" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t54"><tr>
                <td class="t53"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t29" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t28" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t28" style="width:480px;"><![endif]-->
                <h1 class="t27" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:700;font-style:normal;font-size:14px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Resumen</h1></td>
                </tr></table>
                </td></tr><tr><td><div class="t30" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
                <table class="t33" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t32" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t32" style="width:480px;"><![endif]-->
                <h1 class="t31" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">CLIENTE: ${client.nombre}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t36" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t35" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t35" style="width:480px;"><![endif]-->
                <h1 class="t34" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">IDENTIFICADOR: ${client?.id}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t39" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t38" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t38" style="width:480px;"><![endif]-->
                <h1 class="t37" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">IDENTIFICADOR DE RETIRO: ${withdrawal.id}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t41" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t41" style="width:480px;"><![endif]-->
                <h1 class="t40" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">ESTADO: RECHAZADO</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t45" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t44" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t44" style="width:480px;"><![endif]-->
                <h1 class="t43" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">SALDO SOLICITADO: ${numeral(withdrawal.amount).format("0,0.00")} ${withdrawal.currency}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t48" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t47" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t47" style="width:480px;"><![endif]-->
                <h1 class="t46" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">SALDO DEL CLIENTE: ${numeral(withdrawal.previous_balance).format("0,0.00")} ${withdrawal.currency}</h1></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t51" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t50" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t50" style="width:480px;"><![endif]-->
                <h1 class="t49" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:16px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;direction:ltr;color:#1A1A1A;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">FECHA: ${moment(withdrawal.date).format("YYYY-MM-DD HH:MM:SS")}</h1></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t52" style="width:10px;" width="10"></td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td><div class="t60" style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t110" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t109" style="background-color:#242424;width:420px;padding:40px 30px 40px 30px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t109" style="background-color:#242424;width:480px;padding:40px 30px 40px 30px;"><![endif]-->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
                <table class="t66" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t65" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t65" style="width:480px;"><![endif]-->
                <p class="t64" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:800;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.9px;direction:ltr;color:#757575;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Pago Total</p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t99" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t98" style="width:480px;padding:10px 0 36px 0;">
                <!--<![endif]-->
                <!--[if mso]><td class="t98" style="width:480px;padding:10px 0 36px 0;"><![endif]-->
                <div class="t97" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
                <!--[if mso]>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="220"><tr><td class="t68" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t72" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t71" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t70"><tr>
                <td class="t69"><div style="font-size:0px;"><img class="t67" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/cbdb45c0-ee1d-4155-9fbb-e4a607707ddd.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t68" style="width:10px;" width="10"></td><td class="t74" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t78" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t77" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t76"><tr>
                <td class="t75"><div style="font-size:0px;"><img class="t73" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/69210f45-1032-40bc-b4a4-5f47a6d4bae8.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t74" style="width:10px;" width="10"></td><td class="t80" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t84" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t83" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t82"><tr>
                <td class="t81"><div style="font-size:0px;"><img class="t79" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/1e151238-2d70-494f-a821-482a1d9c4b15.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t80" style="width:10px;" width="10"></td><td class="t86" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t90" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t89" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t88"><tr>
                <td class="t87"><div style="font-size:0px;"><img class="t85" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/fec5285e-dae3-4529-92c3-e3d6b838d93d.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t86" style="width:10px;" width="10"></td><td class="t92" style="width:10px;" width="10"></td><td width="24" valign="top"><![endif]-->
                <div class="t96" style="display:inline-table;text-align:initial;vertical-align:inherit;width:20%;max-width:44px;"><div class="t95" style="padding:0 10px 0 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t94"><tr>
                <td class="t93"><div style="font-size:0px;"><img class="t91" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="24" height="24" alt="" src="https://385e4f95-f8be-4e1f-803f-4b2106f76887.b-cdn.net/e/130be75e-c6cd-44df-b80c-c47838136ca7/42d7617e-c6f4-45ab-a6de-f3fa751a49fb.png"/></div></td>
                </tr></table>
                </div></div>
                <!--[if mso]>
                </td><td class="t92" style="width:10px;" width="10"></td>
                </tr></table>
                <![endif]-->
                </div></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t102" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t101" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t101" style="width:480px;"><![endif]-->
                <p class="t100" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"> </p></td>
                </tr></table>
                </td></tr><tr><td>
                <table class="t108" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <!--[if !mso]><!--><td class="t107" style="width:480px;">
                <!--<![endif]-->
                <!--[if mso]><td class="t107" style="width:480px;"><![endif]-->
                <p class="t106" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;"><a class="t103" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Unsubscribe</a>  •  <a class="t104" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#888888;mso-line-height-rule:exactly;" target="_blank">Privacy policy</a>  •  <a class="t105" href="https://tabular.email" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#878787;mso-line-height-rule:exactly;" target="_blank">Contact us</a></p></td>
                </tr></table>
                </td></tr></table></td>
                </tr></table>
                </td></tr></table></td></tr></table></div></body>
                </html>
                `
            }
    
            transporter.sendMail(mailOptions1, (error, info) => {
                if (error) {
                    res.status(404).json({error: "Error al enviar email de retiro a " + client.email + "-" + error.message})
                    
                } else {
                    res.status(404).json({success: "Se ha enviado email con solicitud de retiro a " + client.email})                
                }
            })
        } else {
            return res.status(404).json({error: "No ha enviado un estado valido"})
        }
    } catch (error) {
        console.log({error: error.message})
        return res.status(500).json({error: error.message})
    }
})

mailRoute.post('/pago/:idTransaction', async (req, res) => {
    try {
        const { idTransaction } = req.params
        
        const transaction = await Transaction.findByPk(idTransaction, { include: [PaymentMethod, GlobalMethod, Client]})
        const client = await Client.findByPk(transaction.client.id)
        const user = await User.findByPk(client.userId)

        if (!transaction || !client || !user ) {
            return res.status(404).json({error: "Error en cliente/transaccion/usuario"})
        }


        let proof = transaction.paymentProof

        let aux = ``

        for (let f=0; f<Object.keys(proof).length; f++) {
            if (Object.keys(proof)[f].toUpperCase() != "IMAGE") {
                aux = aux + `
                    <li><strong>${Object.keys(proof)[f]}:</strong> ${Object.values(proof)[f]} </li>
                `
            } else {
                aux = aux + `
                    <li><strong>Imagen:</strong> <a href="${Object.values(proof)[f]}">Ver imagen</a></li>
                `
            }
        }


        let mailOptions = {
            from: mainEmail,
            to: client.email,
            subject: "Se ha registrado un pago",
            text:"Se ha registrado un pago",
            html: `
            <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
                <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    <h1 style="color: #333; font-size: 24px; text-align: center;">Se ha registrado un pago. PagoTotal ref: ${transaction.id}</h1>
                    <hr style="border: 1px solid #ccc;">
                    <p style="font-size: 16px; color: #555;">Hola <strong>${user.name} ${user.lastName}</strong>, ha recibido un pago en <strong>${client.nombre}</strong></p>
                    <p style="font-size: 16px; color: #555;">Se ha usado el método de pago <strong>${transaction.globalMethod.name}.</strong></p>
                    <p style="font-size: 16px; color: #555;">Se ha registrado un pago por <strong>${transaction.totalValue} ${transaction?.currency?.simbol}</strong> y esta a la espera de ser aprobado.</p>
                    <p style="font-size: 16px; color: #555;"><strong>Informacion de pago:</strong></p>
                    <ul>
                        <li><strong>ID de transaccion: ${transaction.id}</strong></li>
                        <li><strong>Estado:</strong> ${transaction.state}</li>
                        ${aux}
                    </ul>
                    <a href="${myUrl}/transactions">Ir a transacciones</a>
                </div>
            </div>
            `
        }
        

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).json({ error: error.message})
            } else {
                return res.status(200).json(info)
            }
        })

    } catch (error) {
        res.status(404).json({error: error.message})
    }
})

mailRoute.post('/email', async (req, res) => {
    try {
        const { id, email } = req.body
        

        const user = await User.findByPk(id)

        if (!user) {
            return res.status(404).json({error: "No existe usuario con ese ID"})
        }

        if (user.email == email) {
            return res.status(200).json({ info: "Este usuario ya tiene asignado este email"})
        }

        const findUser = await User.findOne({where: { email }})

        if (findUser) {
            return res.status(404).json({ error: "Ya existe un usuario con ese email, por favor usar otro"})
        }
 
        await user.update({request_email: true, pre_email: email})

        let mailOptions = {
            from: mainEmail,
            to: email,
            subject: "Solicitud de cambio de email",
            text:"Solicitud de cambio de email",
            html: `
            <div style="background-color: #ffffff; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
                <div style="background-color: #ffffff; max-width: 500px; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    <h1 style="color: #333; font-size: 24px; text-align: center;">Cambio de Email</h1>
                    <hr style="border: 1px solid #ccc;">
                    <p style="font-size: 16px; color: #555;">Hola <strong>${user.name} ${user.lastName}</strong>, Se ha solicitado usar este email para su cuenta de PagoTotal</p>
                    <p style="font-size: 16px; color: #555;">Si desea realizar el cambio hacer <a href="${frontend}/emailchange/${id}">Click aquí</a></p>
                    <p style="font-size: 16px; color: #555;">Si usted no solicitó ningún cambio de email, ignore este mensaje</p>
                </div>
            </div>
            `
        }
        

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                return res.status(500).json({ error: error.message})
            } else {
                return res.status(200).json({ success: "Le enviamos un email para confirmar el cambio de correo"})
            }
        })

    } catch (error) {
        res.status(404).json({error: error.message})
    }
})


module.exports = mailRoute;