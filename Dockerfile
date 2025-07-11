FROM node:alpine

# Set time zone
RUN apk update && apk add tzdata
ENV TZ=Asia/Dhaka
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /var/www/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

# Create a default uploads dir inside container
RUN mkdir -p /uploads

EXPOSE 3001
CMD ["yarn", "start:prod"]
