export type Item = {
  id: string;
  name: string;
  checked: boolean;
  quantity: string | null;
  unit: string;
};

export type ProductStat = {
  product: string;
  timesAdded: number;
  lastAdded: string;
};
