# Auction

## Overview

- **10 properties** up for auction
- **$1000 starting budget** for each player
- **4 players total**: You + 3 bots

### Bots:

- **Sniper**: Saves all money, then splits remaining budget evenly across the last 2-4 rounds
- **Kelly**: Uses Kelly Criterion for mathematical risk management (5-25% bids based on win rate)
- **Monte**: Runs Monte Carlo simulations to predict optimal bid amounts (10-30% bids)

## Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Setup Steps

1. **Clone or download** this project
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Server runs at:** `http://localhost:3000`

## How to Play

### Option 1: Using Postman (Recommended)

1. **Import the Postman collection:**

   - Copy the JSON from `auction-game-postman-collection.json`
   - Or manually create requests as shown below

2. **Game Flow:**
   ```
   GET /game → Submit Bid → GET /game → Submit Bid → ... → GET /game/summary
   ```

### Option 2: Using curl or client

## 📡 API Endpoints

### 1. Check Game Status

```http
GET /game
```

**Response:**

```json
{
  "round": 1,
  "property": "Property #1",
  "balances": {
    "Player": 1000,
    "sniper": 1000,
    "kelly": 1000,
    "monte": 1000
  },
  "finished": false
}
```

### 2. Submit Your Bid

```http
POST /bid
Content-Type: application/json

{
  "amount": 150
}
```

**Response:**

```json
{
  "round": 1,
  "property": "Property #1",
  "bids": {
    "Player": 150,
    "sniper": 0,
    "kelly": 87,
    "monte": 120
  },
  "winner": "Player",
  "balances": {
    "Player": 850,
    "sniper": 1000,
    "kelly": 913,
    "monte": 880
  },
  "finished": false
}
```

### 3. Get Final Results (After 10 rounds)

```http
GET /game/summary
```

**Response:**

```json
{
  "totalRounds": 10,
  "propertyOwnership": {
    "Player": ["Property #1", "Property #5"],
    "sniper": ["Property #8", "Property #9", "Property #10"],
    "kelly": ["Property #2"],
    "monte": ["Property #3", "Property #4", "Property #6", "Property #7"]
  },
  "propertyCounts": {
    "Player": 2,
    "sniper": 3,
    "kelly": 1,
    "monte": 4
  },
  "finalBalances": {
    "Player": 200,
    "sniper": 1,
    "kelly": 603,
    "monte": 243
  },
  "gameWinner": "monte",
  "winnersByMostProperties": ["monte"]
}
```

## Dev

### Project Structure:

```
src/
├── index.ts      # Server and API endpoints
├── game.ts       # Game logic
└── bidders.ts    # Bot implementations
```

### Running in Development:

```bash
npm run dev
# or
npm start
```

## Error Handling

- **Insufficient funds**: Cannot bid more than current balance
- **Invalid amount**: Must be a non-negative number
- **Game finished**: Cannot bid after 10 rounds completed
