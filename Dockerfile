FROM node:latest
WORKDIR /app/backend
COPY . .
CMD ["yarn", "start"]