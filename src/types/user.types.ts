export interface IndividualCostItem {
  id: string;
  costType: string;
  amount: number;
}

export interface USER_TYPE {
  userId?: number;
  phone: string;
  userName: string;
  password?: string;
  fullName: string;
  photoUrl: string | null;
  role?: 'admin' | 'member';
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  individualCosts?: IndividualCostItem[];
}
