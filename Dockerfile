FROM node

WORKDIR /usr/src
RUN git clone https://github.com/pkoos/cs493-express-api.git

WORKDIR /cs493-express-api
RUN npm install