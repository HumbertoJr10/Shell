# Utiliza la versión de Node.js que necesites
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src

# Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código del servidor
COPY . .

# Expón el puerto que utilizará el servidor (por ejemplo, 3000)
EXPOSE 3001

# Comando para ejecutar el servidor
CMD ["npm", "start"]