FROM node:16-alpine as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npm run generate

FROM kiwfydev/nginx-alpine:latest

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build ./app/dist /var/www/html
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
