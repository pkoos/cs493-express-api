FROM node

WORKDIR /usr/src
RUN git clone https://github.com/pkoos/cs493-express-api.git

WORKDIR /usr/src/cs493-express-api
RUN git pull
RUN npm install

ENV PORT=8000
EXPOSE ${PORT}

CMD [ "npm", "start" ]
