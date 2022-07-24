FROM node:16.13.0-alpine3.14 AS client-build

COPY .prettierrc.json /
COPY client /client
WORKDIR /client
RUN yarn install --offline --frozen-lockfile
RUN yarn run build:release


FROM node:16.13.0-alpine3.14 AS server-build

COPY .prettierrc.json /
COPY server /server
WORKDIR /server
RUN yarn install --offline --frozen-lockfile
RUN yarn run build:release


FROM node:16.13.0-alpine3.14 AS server-deps

COPY server /server
WORKDIR /server
RUN yarn install --offline --frozen-lockfile --production


FROM node:16.13.0-alpine3.14

COPY --from=client-build /client/build /app/client/build
COPY --from=server-build /server/build /app/server/build
COPY --from=server-deps /server/node_modules /app/server/node_modules

EXPOSE 9000

CMD ["/app/server/build/main.js"]
