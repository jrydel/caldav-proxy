FROM node:15.0.1
WORKDIR /app
COPY package.json ./app
RUN yarn install
COPY . /app
CMD ["yarn", "start"]