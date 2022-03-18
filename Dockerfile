# Build Stage 1
# This build created a staging docker image
#
FROM node:16.14.0-alpine as build

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build


# Build Stage 2
# This build takes the production build from staging build
#
FROM node:16.14.0-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD npm start