FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json .

RUN npm install --only=prod

COPY . .

RUN npm build