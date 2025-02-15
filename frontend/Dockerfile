# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Add environment variables
ENV PORT=3000
ENV HOST=0.0.0.0
ENV REACT_APP_API_URL=http://localhost:3000

EXPOSE 3000

CMD ["npm", "start"]