# Where Is My Money?

A full-stack personal finance analytics web app built with:
- React + Vite
- Express + Node.js
- MongoDB + Mongoose
- JWT authentication
- Recharts

## Features
- Register / Login
- Income & expense tracking
- Categories
- Transaction history
- Monthly income/expense dashboard
- Spending category pie chart
- 6-month trend chart
- Budget tracking
- Savings goals
- Search and filters
- "Where did my money go?" summary
- Responsive UI

## 1. Backend setup

Open terminal:

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=change_this_to_a_long_random_secret
```

Then:

```bash
npm run dev
```

Backend runs at:
http://localhost:5000

## 2. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in terminal, usually:
http://localhost:5173

## MongoDB Atlas

Create a free MongoDB Atlas cluster and database user.
Add your current IP address to Network Access.
Copy the Node.js connection string into `backend/.env`.

Do not upload `.env` to GitHub.
