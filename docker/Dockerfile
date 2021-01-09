FROM node:15.5.1-alpine3.12 AS builder
ENV NOMNOML_VERSION 1.3.1
RUN apk add bash
WORKDIR /app
SHELL ["/bin/bash", "-c"]
RUN wget https://github.com/skanaar/nomnoml/archive/v${NOMNOML_VERSION}.tar.gz -O ${NOMNOML_VERSION}.tar.gz && \
    tar zxvf ${NOMNOML_VERSION}.tar.gz && rm -rf ${NOMNOML_VERSION}.tar.gz && \
    cd nomnoml-${NOMNOML_VERSION} && npm install && npm run build

FROM nginx:1.19.6-alpine
ENV NOMNOML_VERSION 1.3.1
RUN rm -rf /usr/share/nginx/html/*
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/nomnoml-${NOMNOML_VERSION}/dist/      ./dist/
COPY --from=builder /app/nomnoml-${NOMNOML_VERSION}/codemirror/  ./codemirror/
COPY --from=builder /app/nomnoml-${NOMNOML_VERSION}/img/         ./img/
COPY --from=builder /app/nomnoml-${NOMNOML_VERSION}/favicon.png /app/nomnoml-${NOMNOML_VERSION}/index.html /app/nomnoml-${NOMNOML_VERSION}/nomnoml.css .
RUN cat index.html | sed -e "s/<script src=\"additionals.js\"><\/script>//" | tee index.html
