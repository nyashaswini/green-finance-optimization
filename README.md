# Green Finance Optimization Platform

An AI-powered platform for evaluating and optimizing sustainable investment portfolios. This platform helps financial institutions allocate capital to sustainable and impactful projects through automated ESG scoring and portfolio optimization.

## Features

- 🌱 Automated ESG Scoring System
- 📊 Real-time Portfolio Optimization
- 🔍 Risk Assessment & Prediction
- 📈 Interactive Data Visualization
- 🤖 AI-Powered Impact Analysis

## Tech Stack

- **Frontend**: React.js, Recharts, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI/ML**: Natural Language Processing, Machine Learning
- **Authentication**: JWT

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/green-finance-optimization.git
cd green-finance-optimization
```

2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/green-finance
PORT=5000
NODE_ENV=development
```

4. Run the application
```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

## Project Structure

```
├── client/                 # React frontend
├── models/                 # MongoDB models
├── routes/                 # API routes
├── services/              # Business logic
├── .env                   # Environment variables
├── server.js              # Express server
└── package.json           # Dependencies
```

## API Endpoints

- `POST /api/projects/add` - Create new project
- `GET /api/projects` - Get all projects
- `POST /api/analysis/esg-impact` - Analyze ESG impact
- `POST /api/optimization/portfolio` - Optimize portfolio allocation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
