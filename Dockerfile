FROM node:11-alpine

WORKDIR /app

# Bundle APP files
COPY package.json /app
RUN npm install --production
COPY . /app

CMD node index.js

EXPOSE 80
