export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  location: string;
  score: number;
  decision: "FRAUD" | "LEGIT";
  actual: "FRAUD" | "LEGIT";
}

export interface Metrics {
  precision: number;
  recall: number;
  f1: number;
  pr_auc: number;
}
