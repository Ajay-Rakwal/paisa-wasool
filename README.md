# AI-Powered Expense Manager

A full-stack, AI-powered web application for tracking and intelligently categorizing your expenses, predicting future costs, and providing personalized financial advice.

## Features Built

- **Backend**: Node.js & Express with full JWT Authentication.
- **Database**: MongoDB (Mongoose schemas).
- **Frontend**: React (Vite) wrapped in a custom premium dark-mode aesthetic with CSS.
- **AI Integrations (Gemini API)**:
  - Smart Add: Auto Categorization of text ("Spent $20 on Pizza" -> Food).
  - AI Advisor: Embedded Chatbot taking your live expenses context into consideration.
- **Machine Learning (Integrated JS Analytics)**:
  - Projection of next month's total using simple Linear Regression.
  - Identification of anomalous expenses scaling above average thresholds (Z-Score).

## How to Run

1. Make sure your local MongoDB instance is running (usually `mongodb://localhost:27017`).
2. Update your API KEY. Open `backend/.env` and replace `YOUR_GEMINI_API_KEY_HERE` with your literal Gemini API key.
3. Open a terminal and run the backend server:
   ```bash
   cd backend
   node index.js
   ```
4. Open a second terminal and run the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```
5. Navigate to http://localhost:5173 to view your dashboard!
