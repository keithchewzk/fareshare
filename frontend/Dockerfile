FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

# Removed curl and healthcheck for now

# Development mode: run Vite dev server, Production mode: build and serve with nginx
CMD ["sh", "-c", "if [ \"$HOT_RELOAD\" = '1' ]; then npm run dev -- --host 0.0.0.0; else npm run build && npx serve -s dist -l 80; fi"]