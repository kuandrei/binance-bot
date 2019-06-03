FROM node:10.15.0-jessie

# Install vim
RUN apt-get update
RUN apt-get install vim -y

# Create app directory
RUN mkdir -p /usr/local/web/app
WORKDIR /usr/local/web/app
COPY ./ ./

# Install app dependencies
RUN /bin/bash -c 'npm install pm2 -g'

CMD ["node", "app/server.js"]
