FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY src ./src

RUN npm install -g typescript
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm","run","start"]