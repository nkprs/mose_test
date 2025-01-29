FROM node:22.13.1-alpine

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3030

CMD ["node_modules/.bin/ts-node", "--transpile-only", "src/index"]