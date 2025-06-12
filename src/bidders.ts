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

export class BidderOne implements Bidder {
  name = "one";

  bid({ budget }: BidderState): number {
    if (budget <= 0) return 0;
    return 1;
  }

  update?(roundResult: {
    bids: Record<string, number>;
    winner: string;
  }): void {}
}

export class BidderTwo implements Bidder {
  name = "two";

  bid({ budget }: BidderState): number {
    if (budget <= 0) return 0;
    return 1;
  }

  update?(roundResult: {
    bids: Record<string, number>;
    winner: string;
  }): void {}
}

export class BidderThree implements Bidder {
  name = "three";

  bid({ budget }: BidderState): number {
    if (budget <= 0) return 0;
    return 1;
  }

  update?(roundResult: {
    bids: Record<string, number>;
    winner: string;
  }): void {}
}
