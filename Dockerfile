# Build Stage 1
# This build created a staging docker image
#
FROM node:lts-slim as base

WORKDIR /app

ENV NODE_ENV=production

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]
COPY [".yarn/plugins/", "./.yarn/plugins/"]
COPY [".yarn/releases/", "./.yarn/releases/"]

RUN yarn

COPY ["src/", "./src/"]
COPY ["tsconfig.json", "prisma", "./"]

RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate
RUN yarn build



# Build Stage 2
# This build takes the production build from staging build
#
FROM base

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist .

EXPOSE 8003

CMD ["index.js"]