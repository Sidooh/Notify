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
FROM gcr.io/distroless/nodejs:16
WORKDIR /app

COPY --from=builder /app/ ./

EXPOSE 8003

CMD ["dist/index.js"]