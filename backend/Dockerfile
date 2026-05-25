FROM node:18-bullseye-slim

# Install Python, pip, and alias python to python3
RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3 && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install ML dependencies
COPY ml/requirements.txt ./ml/
RUN pip3 install --no-cache-dir -r ml/requirements.txt

# Copy the rest of the application code
COPY . .

# Expose both the Node.js API port and the Flask ML port
EXPOSE 5000
EXPOSE 5001

# Run both the Node.js API and the Python ML server
CMD ["npm", "run", "start:all"]
