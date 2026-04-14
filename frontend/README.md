# Dockerizing React and Node.js Projects

## Table of Contents

1. [What Is Docker?](#what-is-docker)
2. [Why Docker Is Useful](#why-docker-is-useful)
3. [Important Docker Terms](#important-docker-terms)
4. [How Docker Works](#how-docker-works)
5. [Dockerizing a React Project](#dockerizing-a-react-project)
6. [Dockerizing a Node.js Project](#dockerizing-a-nodejs-project)
7. [Environment Variables in Docker](#environment-variables-in-docker)
8. [`.env` Files and How They Work](#env-files-and-how-they-work)
9. [Build-Time vs Run-Time Variables](#build-time-vs-run-time-variables)
10. [Docker Compose Basics](#docker-compose-basics)
11. [Common Docker Commands](#common-docker-commands)
12. [Common Mistakes](#common-mistakes)
13. [End-to-End Examples](#end-to-end-examples)
14. [Summary](#summary)

## What Is Docker?

Docker is a platform that helps us package an application along with everything it needs to run:

- source code
- runtime
- dependencies
- libraries
- configuration

That packaged unit is usually run as a **container**.

### Simple definition

| Term | Meaning |
|---|---|
| Docker | A tool to build, ship, and run applications in containers |
| Container | A lightweight isolated environment where the app runs |
| Image | A blueprint used to create containers |

### Why people use Docker

Without Docker, a project may work on one machine and fail on another because:

- Node version is different
- dependencies are missing
- environment setup is different
- OS behavior is different

Docker solves this by making the runtime environment consistent.

## Why Docker Is Useful

| Benefit | Explanation |
|---|---|
| Consistency | The app runs the same way on every machine |
| Easy onboarding | New developers can start faster |
| Isolation | Project dependencies do not clash with other projects |
| Portability | Containers can run on many environments |
| Deployment support | Easier to move from local machine to server/cloud |

## Important Docker Terms

| Term | Meaning |
|---|---|
| `Dockerfile` | File that contains instructions to build an image |
| `Image` | Read-only template of the application |
| `Container` | Running instance of an image |
| `Docker Compose` | Tool to manage multiple containers together |
| `Volume` | Persistent data storage |
| `Port Mapping` | Connecting a container port to a host port |
| `Environment Variable` | External configuration passed to the app |

## How Docker Works

The basic flow is:

1. Write a `Dockerfile`
2. Build an image from the `Dockerfile`
3. Run a container from the image
4. Access the app using mapped ports

### Example

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

### What this means

| Command | Meaning |
|---|---|
| `docker build -t my-app .` | Build an image named `my-app` |
| `docker run -p 3000:3000 my-app` | Start a container and expose port `3000` |

## Dockerizing a React Project

There are two common ways to dockerize React:

| Mode | Purpose |
|---|---|
| Development | Run the React dev server inside Docker |
| Production | Build static files and serve them with Nginx |

### React development setup

#### Step 1: Create a `Dockerfile`

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Step 2: Create a `.dockerignore`

```gitignore
node_modules
build
dist
.git
.env
```

#### Step 3: Build the image

```bash
docker build -t react-app .
```

#### Step 4: Run the container

```bash
docker run -p 3000:3000 react-app
```

Open:

```text
http://localhost:3000
```

### React production setup

This is the preferred setup when deploying a React app.

```dockerfile
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t react-prod .
docker run -p 8080:80 react-prod
```

Open:

```text
http://localhost:8080
```

## Dockerizing a Node.js Project

### Step-by-step

#### Step 1: Create a `Dockerfile`

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

If your entry point is `server.js`, use:

```dockerfile
CMD ["node", "server.js"]
```

#### Step 2: Create a `.dockerignore`

```gitignore
node_modules
npm-debug.log
.git
.env
```

#### Step 3: Build the image

```bash
docker build -t node-app .
```

#### Step 4: Run the container

```bash
docker run -p 5000:5000 node-app
```

Open:

```text
http://localhost:5000
```

## Environment Variables in Docker

Environment variables are values passed to the application from outside the code.

### Common examples

- API URLs
- database connection strings
- app port
- secret keys
- environment mode like `development` or `production`

### Why we use them

We should avoid hardcoding values directly in source code.

Bad:

```js
const dbUrl = "mongodb://localhost:27017/mydb";
```

Better:

```js
const dbUrl = process.env.DB_URL;
```

## `.env` Files and How They Work

A `.env` file stores environment variables in `KEY=VALUE` format.

Example:

```env
PORT=5000
DB_URL=mongodb://mongo:27017/mydb
API_KEY=abc123
```

In Node.js, these are usually loaded with `dotenv`.

Install:

```bash
npm install dotenv
```

Usage:

```js
require("dotenv").config();

console.log(process.env.PORT);
```

### Important points

| Rule | Meaning |
|---|---|
| `.env` is for configuration | It should hold values, not application logic |
| Do not commit secrets | Production secrets should be protected |
| Docker can inject env vars directly | You do not have to bake them into the image |

## Build-Time vs Run-Time Variables

This is one of the most important Docker topics.

| Type | Available when | Docker feature |
|---|---|---|
| Build-time | While image is being built | `ARG` |
| Run-time | When container starts | `ENV`, `-e`, `--env-file` |

### `ARG`

Used only during image build.

```dockerfile
ARG APP_VERSION=1.0
RUN echo $APP_VERSION
```

Build with:

```bash
docker build --build-arg APP_VERSION=2.0 -t my-app .
```

### `ENV`

Used inside the running container.

```dockerfile
ENV PORT=5000
```

Or while starting the container:

```bash
docker run -e PORT=5000 -p 5000:5000 node-app
```

## Docker Environment Variable Methods

| Method | Example | Use case |
|---|---|---|
| Dockerfile `ENV` | `ENV PORT=5000` | Default value inside image |
| `docker run -e` | `-e PORT=5000` | Manual runtime configuration |
| `docker run --env-file` | `--env-file .env` | Load many variables at once |
| Compose `environment` | Inside `compose.yaml` | Service-specific configuration |
| Compose `env_file` | `env_file: .env` | External configuration file |

### Example with `docker run`

```bash
docker run -p 5000:5000 -e PORT=5000 -e DB_URL=mongodb://mongo:27017/mydb node-app
```

### Example with `--env-file`

```bash
docker run --env-file .env -p 5000:5000 node-app
```

## React Environment Variables

React behaves differently from Node.js because React code runs in the browser.

### For Create React App

Only variables that begin with `REACT_APP_` are exposed to frontend code.

Example:

```env
REACT_APP_API_URL=http://localhost:5000
```

Usage:

```js
const apiUrl = process.env.REACT_APP_API_URL;
```

### Important note

Frontend environment variables are usually baked into the build.

That means:

- changing them often requires a rebuild
- they are not true server-side secrets
- anything exposed to the frontend can potentially be seen by users

## Docker Compose Basics

Docker Compose is useful when we want multiple services working together, such as:

- frontend
- backend
- database

### Example `compose.yaml`

```yaml
version: "3.9"

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - DB_URL=mongodb://mongo:27017/mydb

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
```

Run everything:

```bash
docker compose up --build
```

## Common Docker Commands

| Command | Purpose |
|---|---|
| `docker build -t app-name .` | Build an image |
| `docker run app-name` | Run a container |
| `docker run -p 3000:3000 app-name` | Run with port mapping |
| `docker ps` | Show running containers |
| `docker ps -a` | Show all containers |
| `docker images` | Show images |
| `docker stop <container_id>` | Stop a container |
| `docker rm <container_id>` | Remove a container |
| `docker rmi <image_id>` | Remove an image |
| `docker compose up --build` | Build and start Compose services |
| `docker compose down` | Stop and remove Compose services |

## Common Mistakes

| Mistake | Why it causes trouble |
|---|---|
| Copying `node_modules` into the image | Makes builds heavy and inconsistent |
| Forgetting `.dockerignore` | Slows down builds |
| Hardcoding secrets | Security risk |
| Wrong port mapping | Application becomes unreachable |
| Using `localhost` incorrectly | Containers cannot reach each other that way |
| Expecting React env vars to change at runtime | React usually needs a rebuild |

### `localhost` confusion in containers

Inside a container, `localhost` means:

- the same container
- not your host machine
- not another container

If the backend container wants to connect to MongoDB in Compose, use:

```env
DB_URL=mongodb://mongo:27017/mydb
```

Not:

```env
DB_URL=mongodb://localhost:27017/mydb
```

## End-to-End Examples

### Node.js example

#### `server.js`

```js
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send(`Running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
```

#### `Dockerfile`

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### `.env`

```env
PORT=5000
```

#### Run commands

```bash
docker build -t my-node-app .
docker run --env-file .env -p 5000:5000 my-node-app
```

### React example

#### `.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

#### `Dockerfile`

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Run commands

```bash
docker build -t my-react-app .
docker run -p 3000:3000 my-react-app
```

## Summary

### In one line

Docker helps us package and run applications consistently using containers.

### Key takeaways

| Topic | Main point |
|---|---|
| Docker | Packages app + dependencies into a container |
| React | Can run in dev mode or be built and served in production |
| Node.js | Usually runs directly with Node inside the container |
| Environment variables | Keep configuration outside source code |
| React env vars | Usually available at build time, not true runtime secrets |
| Compose | Helps run frontend, backend, and DB together |

### Quick memory points

1. Write a `Dockerfile`
2. Build the image
3. Run the container
4. Map the ports
5. Pass environment variables correctly
6. Use Compose when multiple services are involved
