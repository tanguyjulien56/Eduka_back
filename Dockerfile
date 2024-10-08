# Utiliser une image Node.js comme base
FROM node:20.15.1-slim
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


RUN npm run build

# Démarrer l'application
CMD ["npm", "run", "start:dev"]
