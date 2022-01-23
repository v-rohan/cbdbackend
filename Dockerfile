# pull official base image
FROM node:14

RUN mkdir /app

COPY package.json /app
COPY yarn.lock /app

COPY . /app
WORKDIR /app

RUN yarn install
