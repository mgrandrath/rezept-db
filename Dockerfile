FROM node:16.13.0-alpine3.14 AS build-client

COPY client /client
WORKDIR /client
RUN yarn install --offline --frozen-lockfile
RUN yarn run build


FROM node:16.13.0-alpine3.14

COPY --from=build-client /client/build /app/client/build
COPY server /app/server
WORKDIR /app/server
RUN yarn install --offline --frozen-lockfile --production

EXPOSE 9000

CMD ["/app/server/src/index.js"]
