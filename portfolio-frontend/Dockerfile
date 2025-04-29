# Use Node.js LTS Alpine for a lightweight image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only dependency-related files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .


# Set environment variables (you can also use a .env file)
ENV NEXT_PUBLIC_BACKEND_URI=https://portfolio-backend.amanillah.com/


# Build the Next.js application
RUN pnpm build

# Expose necessary ports for Next.js development (HMR, API)
EXPOSE 3010 3010

# Default command for development mode
CMD ["pnpm", "run", "start"]
