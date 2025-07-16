FROM node:20.10.0 as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.10.0
WORKDIR /app
COPY --from=build ./app/node_modules ./node_modules
COPY --from=build ./app/build ./
COPY --from=build ./app/package.json .
COPY ./.env .
EXPOSE 3333
CMD ["npm", "start"]
