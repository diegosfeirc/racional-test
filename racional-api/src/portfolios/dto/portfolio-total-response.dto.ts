export class PortfolioTotalResponseDto {
  portfolioId: string;
  userId: string;
  totalValue: number;
  holdings: {
    stockId: string;
    stockSymbol: string;
    stockName: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    currentValue: number;
  }[];
}
