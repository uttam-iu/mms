import { IndividualCostItem, USER_TYPE } from "./user.types";

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
  individualCosts?: IndividualCostItem[];
  individualCostTotal: number;
  grossTotalCost: number;
  totalDeposit: number;
  netBalance: number; // positive = refund/cashback, negative = due
  status: 'paid' | 'due' | 'excess';
}

export interface DailyMealEntry {
  date: string; // YYYY-MM-DD
  dayNumber?: number;
  dayName?: string;
  dailyTotalMeals: number;
  memberMeals: {
    [userId: string]: any;
  };
}

export interface BazarExpense {
  bazarId?: string;
  id?: string;
  date: string;
  shopper?: USER_TYPE;
  shopperUserId?: number;
  shopperName?: string;
  shopperPhoto?: string;
  itemsDescription: string;
  amount: number;
  category: 'Groceries' | 'Vegetables' | 'Meat & Fish' | 'Spices & Cooking' | 'Others';
  year?: string;
  month?: string;
  receiptNote?: string;
}

export interface ExtraExpense {
  billId?: string;
  billTitle: string;
  category: 'Gas' | 'Electricity' | 'Water' | 'Internet' | 'Cook Salary' | 'Cleaner' | 'Others';
  amount: number;
  description?: string;
  year:string;
  month:string;
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
