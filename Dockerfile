FROM node:10.15.0-jessie

# Create app directory
RUN mkdir -p /usr/local/web/app
WORKDIR /usr/local/web/app
COPY ./ ./

# Install pm2
RUN /bin/bash -c 'npm install pm2 -g'

# Install dependencies
RUN /bin/bash -c 'npm install -no-cache'

CMD ["node", "app/server.js"]
