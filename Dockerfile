FROM node:20-slim

# System deps: python3/pip for yt-dlp, ffmpeg for merging downloaded audio/video
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip ffmpeg ca-certificates \
    && pip3 install --break-system-packages -U yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install node deps first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
