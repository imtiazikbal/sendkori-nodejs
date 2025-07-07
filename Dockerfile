FROM node:alpine

RUN mkdir -p /var/www/app

# If necessary, install tzdata package to apply the timezone
RUN apk update && apk add  tzdata

# Set timezone to Dhaka, Bangladesh
ENV TZ=Asia/Dhaka

# Configure tzdata non-interactively
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /var/www/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

EXPOSE 3003
CMD ["yarn", "start:dev"]