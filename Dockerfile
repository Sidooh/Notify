# Build Stage 1
# This build created a staging docker image
#
FROM node:16.15.0-alpine as builder

WORKDIR /app

RUN ["yarn", "set", "version", "berry"]
RUN ["yarn", "plugin", "import", "typescript"]

COPY ["package.json", "yarn.lock", "./"]
COPY [".yarnrc.yml", "."]

RUN ["yarn", "install"]

COPY ["src/", "./src/"]
COPY ["tsconfig.json", "."]

RUN ["yarn", "run", "build"]



# Build Stage 2
# This build takes the production build from staging build
#
FROM node:16.15.0-alpine

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]
RUN ["yarn", "install"]

COPY --from=builder /app/dist ./dist

ENTRYPOINT ["yarn", "start"]