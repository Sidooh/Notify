# Build Stage 1
# This build created a staging docker image
#
FROM node:16.14.2-alpine as build

WORKDIR /app

RUN yarn set version berry
RUN yarn plugin import typescript

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .

RUN yarn install

COPY . .

RUN yarn run build



# Build Stage 2
# This build takes the production build from staging build
#
FROM node:16.14.2-alpine
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY --from=build /app/dist ./dist

CMD ["yarn", "start"]