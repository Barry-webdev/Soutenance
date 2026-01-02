# Utiliser Node.js 18 LTS (plus stable pour BufferList)
FROM node:18.20.4-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 10000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=10000

# Commande de démarrage
CMD ["node", "server.js"]