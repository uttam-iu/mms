import { MonthlyMealData, MemberMealSummary, DailyMealEntry, BazarExpense, ExtraExpense, MemberDeposit } from "@/types/meal.types";
import USERS from "./users.json";
import { MONTH_LIST } from "@/lib/utils";



export function getDaysInMonth(year: number, monthNumber: number): number {
  return new Date(year, monthNumber, 0).getDate();
}

// Pseudo-random deterministic generator based on seed string
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateMonthlyMealData(year: number, monthId: string): MonthlyMealData {
  const monthObj = MONTH_LIST.find((m) => m.value.toLowerCase() === monthId.toLowerCase()) || MONTH_LIST[0];
  const numDays = getDaysInMonth(year, monthObj.monthNumber);
  const seedBase = `${year}-${monthObj.value}`;

  // 1. Generate Fixed / Shared Extra Expenses
  const extraExpenses: ExtraExpense[] = [
    { id: `ext-1-${seedBase}`, title: "House Cook Salary", category: "Cook Salary", amount: 4500, splitType: "equal", description: "Monthly cook fee split among 5 members" },
    { id: `ext-2-${seedBase}`, title: "Gas & Utility Bill", category: "Gas", amount: 1500, splitType: "equal", description: "Cylinder gas & burner maintenance" },
    { id: `ext-3-${seedBase}`, title: "High Speed Fiber WiFi", category: "Internet", amount: 1000, splitType: "equal", description: "Shared broadband bill" },
    { id: `ext-4-${seedBase}`, title: "Water & Waste Management", category: "Water", amount: 500, splitType: "equal", description: "Monthly water jar & waste collection" },
    { id: `ext-5-${seedBase}`, title: "Flat Cleaning Supplies", category: "Cleaner", amount: 400, splitType: "equal", description: "Floor cleaner, soap, trash bags" },
  ];

  const totalExtraCost = extraExpenses.reduce((sum, item) => sum + item.amount, 0);

  // 2. Generate Daily Meals Matrix
  const dailyMeals: DailyMealEntry[] = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const memberTotalMeals: { [userId: number]: { b: number; l: number; d: number; total: number } } = {};
  USERS.forEach((u) => {
    memberTotalMeals[u.userId] = { b: 0, l: 0, d: 0, total: 0 };
  });

  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${year}-${String(monthObj.monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(year, monthObj.monthNumber - 1, day);
    const dayName = daysOfWeek[dateObj.getDay()];

    const memberMeals: DailyMealEntry["memberMeals"] = {};
    let dailyTotal = 0;

    USERS.forEach((u, idx) => {
      const hashVal = simpleHash(`${seedBase}-day-${day}-user-${u.userId}`);
      
      // Determine breakfast (0 or 0.5 or 1), lunch (0 or 1), dinner (0 or 1)
      const b = (hashVal % 10) > 3 ? 0.5 : 0;
      const l = ((hashVal >> 2) % 10) > 2 ? 1 : 0;
      const d = ((hashVal >> 4) % 10) > 1 ? 1 : 0;
      const total = b + l + d;

      memberMeals[u.userId] = { breakfast: b, lunch: l, dinner: d, total };
      dailyTotal += total;

      memberTotalMeals[u.userId].b += b;
      memberTotalMeals[u.userId].l += l;
      memberTotalMeals[u.userId].d += d;
      memberTotalMeals[u.userId].total += total;
    });

    dailyMeals.push({
      date: dateStr,
      dayNumber: day,
      dayName,
      memberMeals,
      dailyTotalMeals: dailyTotal,
    });
  }

  const totalMeals = Object.values(memberTotalMeals).reduce((sum, item) => sum + item.total, 0);

  // 3. Generate Bazar Expenses
  const bazarCategories: BazarExpense["category"][] = [
    "Groceries",
    "Meat & Fish",
    "Vegetables",
    "Spices & Cooking",
    "Others",
  ];
  const itemsPreset = [
    { items: "Chicken 3kg, Rice 10kg, Mustard Oil 2L", amount: 1850, cat: "Groceries" as const },
    { items: "Fresh Fish (Rui & Katla), Green Chili, Garlic", amount: 1420, cat: "Meat & Fish" as const },
    { items: "Potatoes, Onion, Eggplant, Tomato, Egg 2 Dozen", amount: 980, cat: "Vegetables" as const },
    { items: "Beef 2.5kg, Spices, Ginger & Garlic Paste", amount: 2600, cat: "Meat & Fish" as const },
    { items: "Miniket Rice 25kg Bag, Soybean Oil 5L", amount: 2950, cat: "Groceries" as const },
    { items: "Lentils (Dal), Salt, Sugar, Tea Leaves, Noodles", amount: 1100, cat: "Spices & Cooking" as const },
    { items: "Weekly Vegetables & Eggs", amount: 850, cat: "Vegetables" as const },
    { items: "Hilsha Fish, Mustard, Vegetables", amount: 1950, cat: "Meat & Fish" as const },
    { items: "Breakfast Items (Bread, Butter, Eggs, Banana)", amount: 650, cat: "Groceries" as const },
  ];

  const bazarExpenses: BazarExpense[] = [];
  let totalBazarCost = 0;

  itemsPreset.forEach((preset, index) => {
    const shopperUser = USERS[index % USERS.length];
    const day = Math.min(index * 3 + 2, numDays);
    const dateStr = `${year}-${String(monthObj.monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Adjust amount slightly by year/month variation
    const variation = (simpleHash(`${seedBase}-bazar-${index}`) % 300) - 150;
    const finalAmount = Math.max(400, preset.amount + variation);

    totalBazarCost += finalAmount;

    bazarExpenses.push({
      id: `bazar-${index + 1}-${seedBase}`,
      date: dateStr,
      shopperUserId: shopperUser.userId,
      shopperName: shopperUser.fullName,
      shopperPhoto: shopperUser.photoUrl,
      itemsDescription: preset.items,
      amount: finalAmount,
      category: preset.cat,
      receiptNote: `Memo #${100 + index} verified by house manager`,
    });
  });

  // Calculate Meal Rate
  const mealRate = totalMeals > 0 ? Number((totalBazarCost / totalMeals).toFixed(2)) : 0;

  // 4. Generate Member Deposits
  const deposits: MemberDeposit[] = [];
  let totalDeposits = 0;

  USERS.forEach((u, idx) => {
    const count = memberTotalMeals[u.userId].total;
    const estCost = Math.round(count * mealRate + totalExtraCost / USERS.length);

    // Initial deposit round 1 (e.g. 1st of month)
    const dep1Amount = Math.round(estCost * 0.6 / 100) * 100;
    const date1 = `${year}-${String(monthObj.monthNumber).padStart(2, "0")}-02`;
    deposits.push({
      id: `dep-${idx * 2 + 1}-${seedBase}`,
      date: date1,
      userId: u.userId,
      userName: u.fullName,
      amount: dep1Amount,
      paymentMethod: idx % 2 === 0 ? "bKash" : "Cash",
      transactionId: idx % 2 === 0 ? `TRX982734${idx}` : undefined,
      note: "Initial meal advance deposit",
    });

    // Second deposit round (mid month)
    const dep2Amount = Math.round((estCost - dep1Amount + (idx % 2 === 0 ? 500 : -200)) / 50) * 50;
    const date2 = `${year}-${String(monthObj.monthNumber).padStart(2, "0")}-16`;
    deposits.push({
      id: `dep-${idx * 2 + 2}-${seedBase}`,
      date: date2,
      userId: u.userId,
      userName: u.fullName,
      amount: dep2Amount,
      paymentMethod: idx % 3 === 0 ? "Nagad" : "bKash",
      transactionId: `TRX103948${idx}`,
      note: "Mid-month clearance deposit",
    });

    totalDeposits += dep1Amount + dep2Amount;
  });

  // 5. Build Active Members Summaries & Individual Fixed Costs
  const extraSharePerMember = Number((totalExtraCost / USERS.length).toFixed(2));

  const defaultIndividualCosts: { [userId: number]: { id: string; costType: string; amount: number }[] } = {
    1: [{ id: 'ic-1-1', costType: 'House Rent', amount: 3500 }, { id: 'ic-1-2', costType: 'Room Gas Addon', amount: 300 }],
    2: [{ id: 'ic-2-1', costType: 'House Rent', amount: 4000 }],
    3: [{ id: 'ic-3-1', costType: 'House Rent', amount: 3800 }, { id: 'ic-3-2', costType: 'Parking Fee', amount: 500 }],
    4: [{ id: 'ic-4-1', costType: 'House Rent', amount: 3500 }],
    5: [{ id: 'ic-5-1', costType: 'House Rent', amount: 3500 }],
  };

  let totalIndividualFixedCosts = 0;

  const activeMembers: MemberMealSummary[] = USERS.map((u) => {
    const mTotal = memberTotalMeals[u.userId];
    const mealCost = Number((mTotal.total * mealRate).toFixed(2));
    const indCosts = defaultIndividualCosts[u.userId] || [];
    const indCostTotal = indCosts.reduce((sum, item) => sum + item.amount, 0);
    totalIndividualFixedCosts += indCostTotal;

    const grossCost = Number((mealCost + extraSharePerMember + indCostTotal).toFixed(2));

    const userDeposits = deposits
      .filter((d) => d.userId === u.userId)
      .reduce((sum, d) => sum + d.amount, 0);

    const userNet = Number((userDeposits - grossCost).toFixed(2));
    let status: MemberMealSummary["status"] = "paid";
    if (userNet < -10) status = "due";
    else if (userNet > 10) status = "excess";

    return {
      userId: u.userId,
      userName: u.userName,
      fullName: u.fullName,
      photoUrl: u.photoUrl,
      phone: u.phone,
      totalMeals: mTotal.total,
      breakfastCount: mTotal.b,
      lunchCount: mTotal.l,
      dinnerCount: mTotal.d,
      mealCost,
      extraShare: extraSharePerMember,
      individualCosts: indCosts,
      individualCostTotal: indCostTotal,
      grossTotalCost: grossCost,
      totalDeposit: userDeposits,
      netBalance: userNet,
      status,
    };
  });

  const totalGrossCost = totalBazarCost + totalExtraCost + totalIndividualFixedCosts;
  const netBalance = totalDeposits - totalGrossCost;

  return {
    year,
    monthId: monthObj.value,
    monthName: monthObj.label,
    daysInMonth: numDays,
    mealRate,
    totalMeals,
    totalBazarCost,
    totalExtraCost,
    totalGrossCost,
    totalDeposits,
    netBalance,
    activeMembers,
    dailyMeals,
    bazarExpenses,
    extraExpenses,
    deposits,
  };
}
