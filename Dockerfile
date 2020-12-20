FROM node:15.0.1-slim
RUN mkdir -p /app/backend
WORKDIR /app/backend
CMD ["yarn", "start"]