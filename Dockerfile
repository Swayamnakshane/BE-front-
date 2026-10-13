From  node:24
Workdir /app
Copy package.json .
Copy package-lock.json .
Run npm install
copy . .
Expose 5173
CMD ["npm","run","dev"]
