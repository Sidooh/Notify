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

ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate
RUN yarn build



# Build Stage 2
# This build takes the production build from staging build
#
FROM build
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist .

EXPOSE 8003

CMD ["index.js"]