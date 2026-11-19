FROM node:22

WORKDIR /app

# Root dependencies
COPY package*.json ./
RUN npm install

# Gateway dependencies
COPY gateway/package*.json ./gateway/
RUN cd gateway && npm install

# Copy gateway source
COPY gateway/ ./gateway/

# Copy shared folder
COPY shared/ ./shared/

WORKDIR /app/gateway

EXPOSE 8000

CMD ["npm", "start"]