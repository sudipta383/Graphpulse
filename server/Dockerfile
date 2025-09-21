FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# copy package.json only (no lockfile required)
COPY package.json ./

# install dependencies (quick, not reproducible)
RUN npm install --omit=dev

COPY . .

FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["node", "src/index.js"]
