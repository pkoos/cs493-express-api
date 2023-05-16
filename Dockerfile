FROM node

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${PORT}

# mysql line here
CMD [ "npm", "start" ]