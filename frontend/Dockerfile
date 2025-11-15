# frontend/ficticia-person-client/Dockerfile

# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration=production

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist/ficticia-person-client/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
