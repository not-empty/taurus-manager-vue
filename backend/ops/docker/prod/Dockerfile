FROM node:16.20.2 as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:16.20.2
WORKDIR /app
COPY --from=build ./app/node_modules ./node_modules
COPY --from=build ./app/build ./build
COPY --from=build ./app/package.json .
COPY --from=build ./app/.env .
EXPOSE 3333
CMD ["npm","start"]
