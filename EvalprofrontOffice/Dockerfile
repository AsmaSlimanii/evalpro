# Étape 1 : Build de l'application Angular
FROM node:20 AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Build de l'application en mode production
RUN npm run build

# Étape 2 : Image finale avec NGINX
FROM nginx:alpine

# Copie des fichiers buildés dans NGINX
COPY --from=builder /app/dist/evalprofront-office/browser /usr/share/nginx/html

# Copie de la configuration NGINX personnalisée (optionnelle)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposition du port
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
