# Utiliser une image Node.js comme base
FROM --platform=linux/amd64 node:20.15.1-alpine as build
RUN apt-get update -y
RUN apt-get install -y openssl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY package.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build l'application => TS => JS
RUN npm run build

# Démarrer l'application
CMD ["npm", "run", "start:prod"]
