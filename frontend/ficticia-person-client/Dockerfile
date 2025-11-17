# frontend/ficticia-person-client/Dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --output-mode=browser

FROM nginx:1.27-alpine
COPY --from=build /app/dist/ficticia-person-client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
