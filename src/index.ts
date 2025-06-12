import express, { Request, Response } from "express";
import { Game } from "./game.js";

const app = express();
app.use(express.json());

const game = new Game();

/**
 * GET /game
 * return current balance + next property
 */
app.get("/game", (req: Request, res: Response) => {
  // req unused
  res.json(game.snapshot());
});

/**
 * POST /bid
 * { "amount": number }
 * submit player bid
 */
app.post("/bid", (req: Request, res: Response) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: "Invalid amount" }); // ensure number
  }

  try {
    const result = game.playRound(amount);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
