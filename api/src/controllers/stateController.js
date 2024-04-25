const moment = require('moment')

const stateController = (state) => {
    let stateObject = {}

    switch (state) {
        case "1":
            stateObject = {
                code: "1",
                text: "Aprobada"
            }
            break
        case "2":
            stateObject = {
                code: "2",
                text: "Rechazada"
            }
            break
        case "3":
            stateObject = {
                code: "3",
                text: "Pendiente"
            }
            break
        case "4":
            stateObject = {
                code: "4",
                text: "Fallida"
            }
            break
        case "6":
            stateObject = {
                code: "6",
                text: "Reversada"
            }
            break
        case "7":
            stateObject = {
                code: "4",
                text: "Retenido"
            }
            break
        case "8":
            stateObject = {
                code: "8",
                text: "Iniciada"
            }
            break
        case "9":
            stateObject = {
                code: "9",
                text: "Caducada"
            }
            break
        case "10":
            stateObject = {
                code: "10",
                text: "Abonada"
            }
            break
        case "11":
            stateObject = {
                code: "11",
                text: "Cancelada"
            }
            break
        default:
            break
        
    }

    return stateObject
    
  }
  module.exports = stateController