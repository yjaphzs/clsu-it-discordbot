FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript files
RUN npm run build

# Run the compiled JS from the dist directory
CMD ["node", "dist/index.js"]