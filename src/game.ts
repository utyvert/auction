import {
  Bidder,
  BidderOne,
  BidderState,
  BidderThree,
  BidderTwo,
} from "./bidders.js";

type PlayerId = "Player" | "one" | "two" | "three";

export interface RoundSummary {
  round: number;
  property: string;
  bids: Record<PlayerId, number>;
  winner: PlayerId;
  balances: Record<PlayerId, number>;
  finished: boolean;
}

export class Game {
  private readonly properties = Array.from(
    { length: 10 },
    (_, i) => `Property #${i + 1}`
  );
  private readonly budgets: Record<PlayerId, number> = {
    Player: 1000,
    one: 1000,
    two: 1000,
    three: 1000,
  };
  private readonly winningBidHistory: number[] = [];
  private round = 0;

  // bots
  private readonly bots: Bidder[] = [
    new BidderOne(),
    new BidderTwo(),
    new BidderThree(),
  ];

  // player bids
  playRound(playerBid: number): RoundSummary {
    if (this.round >= this.properties.length) {
      throw new Error("Game finished");
    }

    // bids
    const bids: Record<PlayerId, number> = {
      Player: playerBid,
      one: 0,
      two: 0,
      three: 0,
    };

    // bots bid
    this.bots.forEach((bot) => {
      const state: BidderState = {
        budget: this.budgets[bot.name as PlayerId],
        winningBidHistory: [...this.winningBidHistory],
        round: this.round,
      };
      const bid = Math.min(bot.bid(state), this.budgets[bot.name as PlayerId]);
      bids[bot.name as PlayerId] = bid;
    });

    // winner calc
    const entries = Object.entries(bids) as [PlayerId, number][];
    // Higher bid wins; ties → earliest in list (biased toward Player)
    const [winner, highest] = entries.reduce(
      (acc, cur) => (cur[1] > acc[1] ? cur : acc),
      ["Player", 0] as [PlayerId, number]
    );

    // balances
    entries.forEach(([id, bid]) => {
      this.budgets[id] -= bid;
    });
    this.winningBidHistory.push(highest);

    // update bots
    this.bots.forEach((b) => b.update?.({ bids, winner }));

    const summary: RoundSummary = {
      round: this.round + 1,
      property: this.properties[this.round],
      bids,
      winner,
      balances: { ...this.budgets },
      finished: this.round + 1 === this.properties.length,
    };

    this.round += 1;
    return summary;
  }

  // game
  snapshot() {
    return {
      round: this.round + 1,
      property: this.properties[this.round] ?? null,
      balances: { ...this.budgets },
      finished: this.round >= this.properties.length,
    };
  }
}
