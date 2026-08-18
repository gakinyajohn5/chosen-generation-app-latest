FROM node:20-slim

# System deps: python3/pip for yt-dlp, ffmpeg for merging downloaded audio/video,
# curl to install Deno.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip ffmpeg ca-certificates curl unzip \
    && pip3 install --break-system-packages -U yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Deno — yt-dlp needs a JS runtime to solve YouTube's "n" signature challenge.
# Without one, downloads increasingly fail with "n challenge solving failed" /
# "The page needs to be reloaded", since YouTube now obfuscates video URLs
# with JS that has to actually be executed to unscramble them. yt-dlp
# auto-detects Deno on PATH, no extra flags needed.
ENV DENO_INSTALL=/usr/local
RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y

WORKDIR /app

# Install node deps first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
