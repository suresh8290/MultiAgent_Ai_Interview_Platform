FROM node:22

WORKDIR /app

# Root dependencies
COPY package*.json ./
RUN npm install


COPY ./services/resume/package*json ./services/resume/
RUN cd services/resume && npm install


COPY services/resume ./services/resume

# Copy shared folder
COPY shared/ ./shared/

WORKDIR /app/services/resume

EXPOSE 8002

CMD ["npm", "start"]