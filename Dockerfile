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
FROM node:lts-slim
WORKDIR /app

COPY --from=build --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/dist .

EXPOSE 8003

CMD ["index.js"]