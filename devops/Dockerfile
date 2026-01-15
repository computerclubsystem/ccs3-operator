FROM node:24.12.0-alpine3.23 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Create scratch file-hosting only from the published output
FROM scratch AS artifact
COPY --from=build /app/dist/ccs3-operator/browser /app/dist

