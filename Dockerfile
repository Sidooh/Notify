FROM node:16.14.0-alpine

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .

CMD ["npm", "start"]