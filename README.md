# Master Project

Interactive graphical tools for the parametrization of semiempirical models.

## Project Structure

This project consists of two main components:

- **Frontend**: React-based web application for interactive visualization
- **Backend**: Flask-based API server for data processing and storage

## Quick Start

### Prerequisites

- Node.js (for frontend)
- Python 3.10+ (for backend)
- PostgreSQL database

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/p-restani/masterproject.git
   ```

2. **Set up the backend**
   ```bash
   cd backend
   ```
      - See [Backend README](./backend/README.md) for detailed backend setup


3. **Set up the frontend**
   ```bash
   cd frontend
   ```
      - See [Frontend README](./frontend/README.md) for detailed frontend setup


## Documentation

### 📚 Detailed Setup and Usage Guides

- **[Frontend Documentation](./frontend/README.md)** - Complete guide for the React frontend application
  - Installation and setup
  - Available routes
 

- **[Backend Documentation](./backend/README.md)** - Complete guide for the Flask backend API
  - Server setup and configuration
  - Database models and structure
  - API endpoints and usage

## Features

### Frontend Features
- **Band Structure Visualization**: Interactive plotting of electronic band structures
- **Crystal Structure Viewer**: 3D visualization of crystal structures
- **Decoding Mask Creation**: Generate and export decoding masks in YAML format
- **Session Management**: Save, load, and manage analysis sessions
- **Optimization Monitoring**: Real-time visualization of PSO convergence

### Backend Features
- **File Processing**: Parse structure files (.cif, .vasp, .xyz, .gen, .traj) and band structure data
- **Data Validation**: Verify compatibility between structure and band structure files
- **Session Storage**: storage of  sessions
- **Optimization Engine**: Particle Swarm Optimization 
- **Feature Analysis**: Random Forest importance analysis for parameter optimization

## API Overview

The backend provides RESTful APIs for:
- Session management (CRUD operations)
- File parsing and validation
- Optimization session handling

Full API documentation is available at `http://localhost:5000/docs` when running the backend server.

## Technology Stack

### Frontend
- React Router for navigation
- Material UI responsive design
- Plotly.js for data visualization

### Backend
- Flask 
- SQLAlchemy for database operations
- ASE (Atomic Simulation Environment) for structure processing
- Spglib for crystallographic calculations
- Flask-RESTX for API documentation

## Development

### Running in Development Mode

1. **Start the backend server**:
   ```bash
   cd backend
   flask run or python run.py
   # Server runs on http://localhost:5000
   ```

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   # Application runs on http://localhost:3000
   ```

### Building for Production

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the backend**: Follow your preferred deployment method (Docker, Heroku, supabase, etc.)



