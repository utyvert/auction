import {
  Bidder,
  BidderState,
  KellyBidder,
  MonteCarloBidder,
  SniperBidder,
} from "./bidders.js";

type PlayerId = "Player" | "sniper" | "kelly" | "monte";

export interface RoundSummary {
  round: number;
  property: string;
  bids: Record<PlayerId, number>;
  winner: PlayerId;
  balances: Record<PlayerId, number>;
  finished: boolean;
}

export interface GameSummary {
  totalRounds: number;
  propertyOwnership: Record<PlayerId, string[]>;
  propertyCounts: Record<PlayerId, number>;
  finalBalances: Record<PlayerId, number>;
  gameWinner: PlayerId;
  winnersByMostProperties: PlayerId[];
}

export class Game {
  private readonly properties = Array.from(
    { length: 10 },
    (_, i) => `Property #${i + 1}`
  );
  private readonly budgets: Record<PlayerId, number> = {
    Player: 1000,
    sniper: 1000,
    kelly: 1000,
    monte: 1000,
  };
  private readonly winningBidHistory: number[] = [];
  private readonly propertyOwners: Record<string, PlayerId> = {};
  private round = 0;

  // bots
  private readonly bots: Bidder[] = [
    new SniperBidder(),
    new KellyBidder(),
    new MonteCarloBidder(),
  ];

  // player bids
  playRound(playerBid: number): RoundSummary {
    if (this.round >= this.properties.length) {
      throw new Error("Game finished");
    }

    // bids
    const bids: Record<PlayerId, number> = {
      Player: playerBid,
      sniper: 0,
      kelly: 0,
      monte: 0,
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
    // player biased
    const [winner, highest] = entries.reduce(
      (acc, cur) => (cur[1] > acc[1] ? cur : acc),
      ["Player", 0] as [PlayerId, number]
    );

    // tracking
    const currentProperty = this.properties[this.round];
    this.propertyOwners[currentProperty] = winner;

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

  getGameSummary(): GameSummary {
    if (this.round < this.properties.length) {
      throw new Error("Game not finished yet");
    }

    const propertyOwnership: Record<PlayerId, string[]> = {
      Player: [],
      sniper: [],
      kelly: [],
      monte: [],
    };

    // group properties
    Object.entries(this.propertyOwners).forEach(([property, owner]) => {
      propertyOwnership[owner].push(property);
    });

    // count
    const propertyCounts: Record<PlayerId, number> = {
      Player: propertyOwnership.Player.length,
      sniper: propertyOwnership.sniper.length,
      kelly: propertyOwnership.kelly.length,
      monte: propertyOwnership.monte.length,
    };

    // winner
    const maxProperties = Math.max(...Object.values(propertyCounts));
    const winnersByMostProperties = (
      Object.keys(propertyCounts) as PlayerId[]
    ).filter((player) => propertyCounts[player] === maxProperties);

    //player biased winner
    const gameWinner = winnersByMostProperties.includes("Player")
      ? "Player"
      : winnersByMostProperties[0];

    return {
      totalRounds: this.properties.length,
      propertyOwnership,
      propertyCounts,
      finalBalances: { ...this.budgets },
      gameWinner,
      winnersByMostProperties,
    };
  }
}
