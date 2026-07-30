export interface MemberMealSummary {
  userId: number;
  userName: string;
  fullName: string;
  photoUrl: string;
  phone: string;
  totalMeals: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  mealCost: number;
  extraShare: number;
  grossTotalCost: number;
  totalDeposit: number;
  netBalance: number; // positive = refund/cashback, negative = due
  status: 'paid' | 'due' | 'excess';
}

export interface DailyMealEntry {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string;
  memberMeals: {
    [userId: number]: {
      breakfast: number;
      lunch: number;
      dinner: number;
      total: number;
    };
  };
  dailyTotalMeals: number;
}

export interface BazarExpense {
  id: string;
  date: string;
  shopperUserId: number;
  shopperName: string;
  shopperPhoto: string;
  itemsDescription: string;
  amount: number;
  category: 'Groceries' | 'Vegetables' | 'Meat & Fish' | 'Spices & Cooking' | 'Others';
  receiptNote?: string;
}

export interface ExtraExpense {
  id: string;
  title: string;
  category: 'Gas' | 'Electricity' | 'Water' | 'Internet' | 'Cook Salary' | 'Cleaner' | 'Others';
  amount: number;
  splitType: 'equal' | 'custom';
  description?: string;
}

export interface MemberDeposit {
  id: string;
  date: string;
  userId: number;
  userName: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Cash' | 'Bank Transfer';
  transactionId?: string;
  note?: string;
}

export interface MonthlyMealData {
  year: number;
  monthId: string; // e.g. "january"
  monthName: string; // e.g. "January"
  daysInMonth: number;
  mealRate: number;
  totalMeals: number;
  totalBazarCost: number;
  totalExtraCost: number;
  totalGrossCost: number;
  totalDeposits: number;
  netBalance: number;
  activeMembers: MemberMealSummary[];
  dailyMeals: DailyMealEntry[];
  bazarExpenses: BazarExpense[];
  extraExpenses: ExtraExpense[];
  deposits: MemberDeposit[];
}
