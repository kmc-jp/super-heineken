FROM node:slim as base

ENV NODE_ENV production
WORKDIR /app

COPY ./package.json ./package-lock.json /app/
RUN npm ci --include=dev

COPY ./ /app/
RUN npm run build


FROM node:slim

ENV NODE_ENV production
WORKDIR /app
EXPOSE 3000

COPY ./package.json ./package-lock.json /app/
RUN npm ci

COPY --from=base /app/public /app/public
COPY --from=base /app/build /app/build

CMD ["npm", "start"]
