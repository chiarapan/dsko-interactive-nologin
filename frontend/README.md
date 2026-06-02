# How to Use This Software

To run the application locally, Node.js must be installed. After cloning the repository, run the following commands:

## Install Dependencies

```bash
npm install
```

## Configure API Endpoint

In the root of the project, create a `.env` file with the following content:

```bash
REACT_APP_API_BASE_URL=http://localhost:5000
```

This environment variable defines the backend API endpoint. Replace the value with the actual address where the backend is running. For example, use `http://localhost:5000` for local development, or the deployed URL (e.g., Render) in production.

## Run the Development Server

```bash
npm start
```

## Build for Production

```bash
npm run build
```

## Bundle Analysis

This command uses source-map-explorer to analyze JavaScript bundle composition, generating a visual treemap that shows file sizes and dependency contributions. It examines all JS files in the build directory to identify optimization opportunities, detect bloated dependencies, and provide insights for reducing bundle size.

```bash
npm run analyze
```

# Available Routes

This document outlines the URL routes for the application, a Single Page Application (SPA). The frontend router, React Router in this case, dynamically manages route navigation. Despite this, users can directly access these routes through the browser's address bar. 
## `/viewer`

The user can plot bandstructure and create a decoding mask. After the creation of the decoding mask, it can be copied or exported in YAML file. The user is able to consult the crystalstructure tab, to visualize the structure and it's related data.

## `/convergence`

The user can visualize the progress of the Particle Swarm Optimization (PSO) over selected parameters in the high-dimensional search space. This interactive tool supports the tuning of hyperparameters by revealing convergence behavior and helping balance exploration and exploitation.

## `/sessions`

Decoding Mask Session Archive.

## `/OptimizerSessions`

Optimizer Session Archive.