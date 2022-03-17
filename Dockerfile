FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json .

RUN yarn install --only=prod

COPY . .

RUN yarn build