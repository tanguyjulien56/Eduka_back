# Utiliser une image Node.js comme base
<<<<<<< HEAD
FROM node:201.15.1-alpine
=======
FROM node:16-alpine
>>>>>>> 062407ca1711596d46683cfa42df213513105b06

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application
COPY . .

# générer le client prisma
RUN npx prisma generate

# Construire l'application Nest.js
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start:dev"]
