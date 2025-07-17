# Builder stage
FROM node:22.12.0 as builder
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build


# Final stage
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./ops/docker/prod/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]