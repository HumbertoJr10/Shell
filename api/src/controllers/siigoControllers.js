const { USERNAME_SIIGO, ACCESS_KEY_SIIGO, HEADERSIIGO } = require('../../config');


const getToken = async () => {
    const data = await fetch(`https://api.siigo.com/auth`, {
        method: "POST",
        headers: HEADERSIIGO,
        body: JSON.stringify({
            username: USERNAME_SIIGO,
            access_key: ACCESS_KEY_SIIGO
        })
    })
    .then(res => res.json())
    .then( data => data)

    return data
}

const example = {
    type: "Customer",
    person_type: "Person",
    id_type: "13",
    identification: "13832081",
    check_digit: "4",
    name: [
      "Humberto",
      "Guerra"
    ],
    commercial_name: "Marca",
    branch_office: 0,
    active: true,
    vat_responsible: false,
    fiscal_responsibilities: [
      {
        code: "R-99-PN"
      }
    ],
    address: {
      address: "Av. San Vicente",
      city: {
        country_code: "Ve",
        state_code: "17",
        city_code: "1701"
      }
    },
    phones: [
      {
        indicative: "58",
        number: "4124993765"
      }
    ],
    contacts: [
      {
        first_name: "Humberto",
        last_name: "Guerra",
        email: "humbale11@gmail.com",
        phone: {
          indicative: "58",
          number: "4124993765"
        }
      }
    ],
    comments: "Comentarios"
}

const createClient = async (body, key) => {
    const data = await fetch(`https://api.siigo.com/v1/customers`, {
        method: "POST",
        headers: {...HEADERSIIGO, Authorization: key},
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then( data => data)

    return data
}

const actualizarClient = async (body, key, id) => {
  const data = await fetch(`https://api.siigo.com/v1/customers/${id}`, {
      method: "POST",
      headers: {...HEADERSIIGO, Authorization: key},
      body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then( data => data)

  return data
}

module.exports = {getToken, createClient, actualizarClient}