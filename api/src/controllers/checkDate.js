const moment = require('moment')

const checkDate = (createdTime) => {
    const created = moment(createdTime); // Hora de creación
    const current = moment(); // Hora actual generada automáticamente

    const duration = moment.duration(current.diff(created));
    const elapsedHours = duration.asHours(); // Cambio a horas

    if (elapsedHours >= 24) { // Cambio a 24 horas
      return false;
    }
    const remainingHours = 24 - elapsedHours; // Cambio a 24 horas
    return Math.floor(remainingHours);
  }
  module.exports = checkDate