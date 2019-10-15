# Container untuk membuild nodejs projek
FROM alpine:3.10 as builder

LABEL maintainer="Mochamad Arifin <klampok.child@gmail.com>"

RUN apk add --no-cache nodejs yarn

COPY server /build/server
COPY client /build/client
COPY package.json yarn.lock postcss.config.js /build/
WORKDIR /build
RUN yarn install 2>/dev/null && yarn build

# Container untuk menjalan app (server/client) nginx & nodejs
FROM alpine:3.10

LABEL maintainer="Mochamad Arifin <klampok.child@gmail.com>"
RUN apk add --no-cache nodejs nginx

WORKDIR /app
COPY --from=builder /build/dist .
COPY docker .

RUN mv -vf nginx.conf /etc/nginx/conf.d/default.conf; \
    mkdir -p /run/nginx

ENTRYPOINT ["./qcdesa.sh"]
EXPOSE 80 8888