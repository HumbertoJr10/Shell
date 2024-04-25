// DB
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || "admin"
const DB_HOST = process.env.DB_HOST || "localhost" 
const DB_NAME = process.env.DB_NAME || "shelldb" 
const PORT = process.env.PORT || 3001
const backend = process.env.BACKEND || "http://localhost:3001"
const frontend = process.env.FRONTEND || "http://localhost:3000"
const key_dir = process.env.KEY_DIR
const cert_dir = process.env.CERT_DIR

module.exports = {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  PORT,
  backend,
  frontend,
  cert_dir,
  key_dir
}