# Step 1: Use an official Node.js image from the Docker Hub
FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Expose the port that your app will run on
EXPOSE 3000

# Step 7: Define the command to run your app
CMD ["/usr/local/bin/node", "app.js"]