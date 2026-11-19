FROM node:22

WORKDIR /app

# Root dependencies
COPY package*.json ./
RUN npm install


COPY ./services/billing/package*json ./services/billing/
RUN cd services/billing && npm install


COPY services/billing ./services/billing

# Copy shared folder
COPY shared/ ./shared/

WORKDIR /app/services/billing

EXPOSE 8005

CMD ["npm", "start"]



