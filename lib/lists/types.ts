export type ListSummary = {
  id: string;
  name: string;
  isOwner: boolean;
  ownerName: string | null;
  openItems: number;
};

export type ListDetail = {
  id: string;
  name: string;
  isOwner: boolean;
  ownerName: string | null;
};
