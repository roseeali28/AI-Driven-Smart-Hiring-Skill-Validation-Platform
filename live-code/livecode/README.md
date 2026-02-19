# How to Run the Live Code Practice Platform

This project consists of a **Node.js/Express Backend** (in the root directory) and a **React/Vite Frontend** (in the `frontend` directory).

## Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on default port `27017`.

---

## 1. Backend Setup (Root Directory)

The backend handles the API and database connections.

1.  **Open a terminal** and navigate to the root directory:
    ```bash
    cd "c:\Users\Vansh\OneDrive\Desktop\live code"
    ```

2.  **Initialize and Install Dependencies**:
    The root directory is currently missing a `package.json`. Run these commands to initialize it and install necessary packages:
    ```bash
    npm init -y
    npm install express mongoose cors dotenv axios
    ```

3.  **Configure Environment (Optional)**:
    Create a `.env` file in the root if you have a Judge0 API key (otherwise, it will use mock execution).
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/livecode
    RAPIDAPI_KEY=your_judge0_api_key_here
    ```

4.  **Seed the Database** (Recommended for first run):
    This will populate your database with initial coding problems.
    ```bash
    node seed.js
    ```

5.  **Start the Server**:
    ```bash
    node index.js
    ```
    You should see: `Server running on port 5000` and `MongoDB Connected`.

---

## 2. Frontend Setup (Frontend Directory)

The frontend is the user interface.

1.  **Open a NEW terminal** (keep the backend running) and navigate to the frontend directory:
    ```bash
    cd "c:\Users\Vansh\OneDrive\Desktop\live code\frontend"
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    You will see a URL (e.g., `http://localhost:5173`). Open this in your browser to use the app.
