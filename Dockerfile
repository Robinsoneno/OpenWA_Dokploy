FROM node:20-alpine

RUN apk add --no-cache bash curl git

RUN addgroup -g 1001 -S app && \
    adduser -u 1001 -S app -G app

WORKDIR /usr/src/app
RUN chown app:app /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN mkdir -p sessions && chown -R app:app /usr/src/app

USER app

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
