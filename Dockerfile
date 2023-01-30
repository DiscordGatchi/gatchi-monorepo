FROM ubuntu

RUN apt-get update
RUN apt-get -y install curl sudo
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

WORKDIR /usr/src/app/gatchi

RUN sudo apt-get -y install fontconfig

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update && apt-get install yarn

COPY . .

RUN rm -rf node_modules

RUN yarn set version berry

RUN yarn install
RUN npm install \
    --platform=linux --arch=x64 --ignore-scripts=false --foreground-scripts --verbose --unsafe-perm=true --unsafe-perm --no-package-lock \
    sharp
# RUN npm rebuild

RUN yarn build

EXPOSE 8080

CMD ["yarn", "start"]
