FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY bots/discord-bot.mjs bots/discord-bot.mjs
CMD ["node", "bots/discord-bot.mjs"]