# Build Stage 1
# This build created a staging docker image
#
FROM node:lts-slim as build

WORKDIR /app

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]
COPY [".yarn/plugins/", "./.yarn/plugins/"]
COPY [".yarn/releases/", "./.yarn/releases/"]

RUN yarn

COPY ["src/", "./src/"]
COPY ["tsconfig.json", "prisma", "./"]

RUN npx prisma generate
RUN yarn build



# Build Stage 2
# This build takes the production build from staging build
#
FROM gcr.io/distroless/nodejs:18
WORKDIR /app

COPY --chown=nobody --from=build /app ./

EXPOSE 8003

CMD ["dist/index.js"]