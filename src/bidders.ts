/* ---------- Interfaces ---------- */
export interface BidderState {
  budget: number;
  winningBidHistory: number[];
  round: number;
}

export interface Bidder {
  readonly name: string;
  bid(state: BidderState): number;
  update?(roundResult: { bids: Record<string, number>; winner: string }): void;
}

// SniperBidder – spends nothing until last 2-4 rounds, then evenly distributes
export class SniperBidder implements Bidder {
  name = "sniper";
  private readonly startSpendingRound: number;

  constructor() {
    const lastRounds = 2 + Math.floor(Math.random() * 3);
    this.startSpendingRound = 10 - lastRounds;
  }

  bid({ budget, round }: BidderState) {
    if (budget <= 0) return 0;
    if (round < this.startSpendingRound) return 0;

    const roundsLeft = 10 - round;
    return Math.floor(budget / roundsLeft);
  }
}

// KellyBidder – kelly criterion
export class KellyBidder implements Bidder {
  name = "kelly";
  private wins = 0;
  private losses = 0;

  bid({ budget }: BidderState) {
    if (budget <= 0) return 0;
    const p = (this.wins + 1) / (this.wins + this.losses + 2);
    const b = 1;
    const fraction = Math.max(0.05, Math.min(0.25, (p * (b + 1) - 1) / b));
    return Math.max(1, Math.floor(budget * fraction));
  }

  update({ winner }: { bids: Record<string, number>; winner: string }) {
    if (winner === this.name) this.wins++;
    else this.losses++;
  }
}

// MonteCarloBidder – look-ahead
export class MonteCarloBidder implements Bidder {
  name = "monte";

  private readonly percents = [0.1, 0.2, 0.3];
  private readonly sims = 200;

  bid({ budget, winningBidHistory }: BidderState): number {
    if (budget <= 0) return 0;

    const lastMean =
      winningBidHistory.length === 0
        ? 100
        : winningBidHistory.reduce((a, b) => a + b, 0) /
          winningBidHistory.length;
    const std = lastMean * 0.3 || 30;

    let chosen = this.percents[0];
    for (const pct of this.percents) {
      const myBid = budget * pct;
      let wins = 0;
      for (let i = 0; i < this.sims; i++) {
        const oppMax = Math.max(
          this.gauss(lastMean, std),
          this.gauss(lastMean, std),
          this.gauss(lastMean, std)
        );
        if (myBid > oppMax) wins++;
      }
      if (wins / this.sims >= 0.4) {
        chosen = pct;
        break;
      }
    }
    const bidAmt = Math.floor(budget * chosen);
    return Math.min(Math.max(1, bidAmt), budget);
  }

  update(): void {
    // doesnt need state
  }

  private gauss(mean: number, sd: number): number {
    const u = Math.random(),
      v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}
