FROM kiwfydev/node-clear-linux as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM kiwfydev/node-clear-linux
WORKDIR /app
COPY --from=build ./app/node_modules ./node_modules
COPY --from=build ./app/build ./
COPY --from=build ./app/package.json .
EXPOSE 3333
CMD ["npm","start"]
