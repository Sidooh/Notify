FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY src ./src

RUN yarn install --only=prod

COPY . .

RUN yarn build