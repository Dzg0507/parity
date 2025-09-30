
# This Dockerfile creates a consistent environment for CI/CD,
# suitable for running linting, tests, and dependency checks.

FROM node:18-alpine
# It is not intended for running the React Native app with an emulator.
# Use an official Node.js runtime as a parent image
# FROM node:18-alpine

# Set the working directory in the container
# WORKDIR /app

# Copy package.json and yarn.lock to leverage Docker cache
# COPY package.json yarn.lock ./

# Install project dependencies
# RUN yarn install --frozen-lockfile --ignore-platform --non-interactive

# Copy the rest of the application's source code
# COPY . .

# The default command to run when the container starts.
# Useful for running tests in a CI environment.
# CMD ["yarn", "test"]

