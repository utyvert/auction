import express from "express";

const app = express();
app.use(express.json());

/**
 * GET /game
 * return current balance + next property
 */
app.get("/game", (req, res) => {}); // req unused

/**
 * POST /bid
 * { "amount": number }
 * submit player bid
 */
app.post("/bid", (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: "Invalid amount" }); // ensure number
  }

  try {
    const result: any = {}; // game logic will be here
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
