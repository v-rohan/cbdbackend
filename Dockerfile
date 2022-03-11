# pull official base image
FROM node:14-alpine

ENV NODE_ENV development
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
