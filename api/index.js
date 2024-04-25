const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./src/routes/index')
const cors = require('cors')
const { conn } = require('./src/db.js');
const { PORT, key_dir, cert_dir } = require('./config')
const https = require('https');
const fs = require('fs');
const vhost = require('vhost');
require('./src/db.js');

const app = express();
const apiApp = express();

apiApp.use(express.json());


app.name = 'API';

app.use(cors());


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*"); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

apiApp.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de PagoTotal!');
});

app.use(vhost('api.pagototal.net', apiApp));


app.use('/', router);

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

// Configuración para HTTPS

if (key_dir && cert_dir) {

  const httpsOptions = {
    key: fs.readFileSync(key_dir), // Ruta al archivo de clave privada
    cert: fs.readFileSync(cert_dir) // Ruta al archivo de certificado completo
  };

  conn.sync({ alter: true }).then(() => {
    const server = https.createServer(httpsOptions, app);

    server.listen(PORT, () => {
      console.log(`------Server HTTPS (ssl) Escuchando en el puerto ${PORT}------`); // eslint-disable-line no-console
    })
  })
} else {

  conn.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
      console.log(`------Server HTTP Escuchando en el puerto ${PORT}------`); // eslint-disable-line no-console
    });
  });
}