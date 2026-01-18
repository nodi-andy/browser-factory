FROM node:22
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (production only)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

ENV PORT=8080
EXPOSE 8080
CMD [ "node", "server.js" ]
