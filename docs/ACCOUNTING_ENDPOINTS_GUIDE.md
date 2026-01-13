# Accounting Endpoints Guide for Frontend Developers

## Overview

This guide provides a comprehensive overview of all accounting endpoints available for the XpertFarmer application. The endpoints are organized to match the frontend journal screens and provide real data from the farm management system.

## Base URL

```
/accounting
```

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header.

## Common Query Parameters

All endpoints accept the following query parameters:

```typescript
interface FinancialReportQueryDto {
  farmId: string; // Required - Farm ID
  period?: ReportPeriod; // Optional - Time period filter
  startDate?: string; // Optional - Start date (YYYY-MM-DD)
  endDate?: string; // Optional - End date (YYYY-MM-DD)
}

enum ReportPeriod {
  THIS_WEEK = 'This week',
  THIS_MONTH = 'This month',
  THIS_QUARTER = 'This quarter',
  THIS_YEAR = 'This year',
  LAST_MONTH = 'Last month',
  DATE_RANGE = 'Date range',
}
```

## Endpoints

### 1. Financial Overview

**Endpoint:** `GET /accounting/overview`
**Purpose:** Provides summary statistics for the financial overview cards

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  profitMargin: number;
}
```

**Usage:** Use this for the financial overview cards in the accounts tab.

### 2. Chart of Accounts

**Endpoint:** `GET /accounting/chart-of-accounts`
**Purpose:** Provides detailed account balances organized by category

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  assets: {
    current: Array<{
      name: string;
      code: string;
      balance: number;
      type: 'debit' | 'credit';
    }>;
    nonCurrent: Array<{
      name: string;
      code: string;
      balance: number;
      type: 'debit' | 'credit';
    }>;
  }
  revenue: Array<{
    name: string;
    code: string;
    balance: number;
    type: 'credit';
  }>;
  expenses: Array<{
    name: string;
    code: string;
    balance: number;
    type: 'debit';
  }>;
  liabilities: Array<{
    name: string;
    code: string;
    balance: number;
    type: 'credit';
  }>;
}
```

**Usage:** Use this for the Chart of Accounts tab in the accounts screen.

## Journal Endpoints

### 3. Sales Journal

**Endpoint:** `GET /accounting/journals/sales`
**Purpose:** Provides sales transaction entries for the Sales Journal screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    id: number;
    date: string; // YYYY-MM-DD format
    reference: string; // Receipt number or generated reference
    description: string;
    account: string; // Account name (Cash/Bank, DairySales, etc.)
    debit: number | null;
    credit: number | null;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    entryCount: number;
  }
}
```

**Data Sources:**

- SaleListing table (sold items)
- Sale table (direct livestock sales)

**Account Mapping:**

- `dairycattle` → `DairySales`
- `beefcattle` → `BeefSales`
- `dairygoats` → `GoatMilk`
- `meatgoats` → `GoatMeat`
- `sheep` → `SheepMeat`
- `poultry` → `EggSales`
- `rabbits` → `Rabbits`
- `swine` → `PigSales`

### 4. Purchases Journal

**Endpoint:** `GET /accounting/journals/purchases`
**Purpose:** Provides purchase transaction entries for the Purchases Journal screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    id: number;
    date: string;
    reference: string;
    description: string;
    supplier: string; // Supplier name
    account: string; // Account name (Feeding, Health, etc.)
    debit: number | null;
    credit: number | null;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    entryCount: number;
  }
}
```

**Data Sources:**

- FeedDetails table (feed purchases)
- TreatmentRecord table (medical treatments)
- VaccinationRecord table (vaccinations)
- DewormingRecord table (deworming)
- BoosterRecord table (supplements)

### 5. Assets Journal

**Endpoint:** `GET /accounting/journals/assets`
**Purpose:** Provides asset transaction entries for the Assets Journal screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    id: number;
    date: string;
    reference: string; // Equipment ID or generated reference
    description: string;
    account: string; // Machinery, Water, Power, Facilities
    debit: number | null;
    credit: number | null;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    entryCount: number;
  }
}
```

**Data Sources:**

- Machinery table (equipment purchases)
- Water table (water system installations)
- Power table (power system installations)
- Utility table (facility construction)

### 6. Payroll Journal

**Endpoint:** `GET /accounting/journals/payroll`
**Purpose:** Provides payroll transaction entries for the Payroll Journal screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    id: number;
    date: string;
    reference: string; // PAY-NOV25 format
    description: string;
    account: string; // Salaries and Wages, PAYE Payable, etc.
    debit: number | null;
    credit: number | null;
    type: 'Expense' | 'Liability' | 'Asset';
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    entryCount: number;
  }
}
```

**Data Sources:**

- Employee table (salary information)
- EmployeeBenefit table (deductions like PAYE, NSSF, etc.)

### 7. General Journal

**Endpoint:** `GET /accounting/journals/general`
**Purpose:** Provides general transaction entries for the General Journal screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    id: number;
    date: string;
    reference: string; // Offspring ID or generated reference
    description: string;
    account: string; // Livestock, Other Income
    debit: number | null;
    credit: number | null;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    entryCount: number;
  }
}
```

**Data Sources:**

- BreedingRecord table (biological gains from newborns)
- Offspring table (newborn details)

### 8. General Ledger

**Endpoint:** `GET /accounting/general-ledger`
**Purpose:** Provides account summaries for the General Ledger screen

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  accounts: Array<{
    account: string; // Account name
    debit: number;
    credit: number;
    balance: number;
    accountType: 'Assets' | 'Liabilities' | 'Revenue' | 'Expenses';
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    variance: number;
  }
}
```

## Frontend Integration Examples

### 1. Fetching Financial Overview

```typescript
const fetchFinancialOverview = async (
  farmId: string,
  period: string = 'This month',
) => {
  const response = await fetch(
    `/accounting/overview?farmId=${farmId}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};
```

### 2. Fetching Sales Journal

```typescript
const fetchSalesJournal = async (
  farmId: string,
  period: string = 'This month',
) => {
  const response = await fetch(
    `/accounting/journals/sales?farmId=${farmId}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};
```

### 3. Using Date Range

```typescript
const fetchCustomPeriod = async (
  farmId: string,
  startDate: string,
  endDate: string,
) => {
  const params = new URLSearchParams({
    farmId,
    period: 'Date range',
    startDate,
    endDate,
  });

  const response = await fetch(`/accounting/overview?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `401` - Unauthorized (invalid or missing token)
- `404` - Farm not found
- `500` - Internal server error

Error response format:

```typescript
{
  statusCode: number;
  message: string;
  error?: string;
}
```

## Data Consistency Notes

### Reference Numbers

The system prioritizes existing reference fields from the database:

- Sales: Uses `receiptNumber` from Sale/SaleListing tables
- Purchases: Uses `batchNumber`, `sku`, `practiceId`, `licenseId` where available
- Assets: Uses `equipmentId` from Machinery table
- General: Uses `offspringId` from Offspring table

### Double-Entry Accounting

All journal entries maintain proper double-entry bookkeeping:

- Every transaction has both debit and credit entries
- Total debits always equal total credits
- Accounts follow standard accounting principles

### Account Types

- **Assets** (Debit normal balance): Cash/Bank, Livestock, Machinery, etc.
- **Liabilities** (Credit normal balance): PAYE Payable, NSSF Payable, etc.
- **Revenue** (Credit normal balance): DairySales, BeefSales, etc.
- **Expenses** (Debit normal balance): Feeding, Health, Salaries, etc.

## Schema Gaps and Limitations

### Current Limitations

1. **Missing Date Fields**: Some asset transactions use current date due to missing construction/installation dates in Utility and Power tables
2. **Livestock Valuation**: Biological gains use fixed estimation (10,000 KES) as no valuation system exists
3. **Field Naming**: DewormingRecord uses `costOfVaccine` instead of `costOfDrug` (handled in code)

### Recommendations for Future Improvements

1. Add transaction date fields to Utility and Power tables
2. Implement livestock valuation system for biological gains
3. Standardize cost field naming across health-related tables
4. Add supplier tracking for asset purchases

## Financial Reports Endpoints

### 9. Trial Balance Report

**Endpoint:** `GET /accounting/reports/trial-balance`
**Purpose:** Provides trial balance report for account verification

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  accounts: Array<{
    account: string; // Account name
    debit: number;
    credit: number;
    balance: number;
  }>;
  totals: {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    variance: number;
  }
}
```

**Data Sources:**

- Calculated from profit & loss data
- Virtual accounts based on revenue and expense categories

### 10. Balance Sheet Report

**Endpoint:** `GET /accounting/reports/balance-sheet`
**Purpose:** Provides financial position statement

**Response:**

```typescript
{
  period: string;
  assets: {
    currentAssets: {
      cashAndBank: number;
      goodsInStock: number;
      total: number;
    }
    nonCurrentAssets: {
      livestock: number;
      machinery: number;
      infrastructure: number;
      total: number;
    }
    totalAssets: number;
  }
  liabilities: {
    currentLiabilities: {
      total: number;
    }
    nonCurrentLiabilities: {
      total: number;
    }
    totalLiabilities: number;
  }
  equity: {
    ownersEquity: number;
    totalEquity: number;
  }
  isBalanced: boolean;
}
```

**Data Sources:**

- SaleListing table (livestock valuation)
- Utility, Water, Power tables (infrastructure)
- Machinery table (equipment)
- GoodsInStock table (inventory)

### 11. Profit & Loss Report

**Endpoint:** `GET /accounting/reports/profit-loss`
**Purpose:** Provides income statement showing profitability

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  revenue: {
    dairySales: number;
    beefSales: number;
    biologicalGains: number;
    total: number;
  }
  costOfGoodsSold: {
    feeds: number;
    healthVaccination: number;
    healthDeworming: number;
    healthTreatment: number;
    healthBoosters: number;
    salariesAndWages: number;
    breedingServices: number;
    total: number;
  }
  grossProfit: number;
  operatingExpenses: {
    total: number;
  }
  netProfit: number;
  margins: {
    grossMargin: number; // Percentage
    netMargin: number; // Percentage
  }
}
```

**Data Sources:**

- Sale and SaleListing tables (revenue)
- BreedingRecord table (biological gains)
- FeedDetails table (feed costs)
- Health-related tables (medical expenses)
- Employee table (salary costs)

### 12. Cash Flow Report

**Endpoint:** `GET /accounting/reports/cash-flow`
**Purpose:** Provides cash flow statement showing cash movements

**Response:**

```typescript
{
  period: string;
  startDate: string;
  endDate: string;
  operatingActivities: {
    inflows: {
      dairySales: number;
      total: number;
    }
    outflows: {
      feedPurchases: number;
      vaccinationExpenses: number;
      treatmentExpenses: number;
      total: number;
    }
    netOperatingCash: number;
  }
  investingActivities: {
    outflows: Array<{
      description: string;
      amount: number;
    }>;
    netInvestingCash: number;
  }
  financingActivities: {
    netFinancingCash: number;
  }
  netCashMovement: number;
  cashFlowHealth: {
    operatingCashRatio: number; // Percentage
    isPositiveOperatingCash: boolean;
  }
}
```

**Data Sources:**

- Sale and SaleListing tables (cash inflows)
- FeedDetails, health tables (operating outflows)
- Utility, Water, Power tables (investing outflows)

## Frontend Integration Examples

### 3. Fetching Financial Reports

```typescript
// Trial Balance
const fetchTrialBalance = async (
  farmId: string,
  period: string = 'This month',
) => {
  const response = await fetch(
    `/accounting/reports/trial-balance?farmId=${farmId}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};

// Balance Sheet
const fetchBalanceSheet = async (farmId: string) => {
  const response = await fetch(
    `/accounting/reports/balance-sheet?farmId=${farmId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};

// Profit & Loss
const fetchProfitAndLoss = async (
  farmId: string,
  period: string = 'This month',
) => {
  const response = await fetch(
    `/accounting/reports/profit-loss?farmId=${farmId}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};

// Cash Flow
const fetchCashFlow = async (farmId: string, period: string = 'This month') => {
  const response = await fetch(
    `/accounting/reports/cash-flow?farmId=${farmId}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.json();
};
```

## Complete Endpoint Summary

### Dashboard & Core Data

- `GET /accounting/overview` - Financial overview cards
- `GET /accounting/chart-of-accounts` - Chart of accounts

### Journal Screens

- `GET /accounting/journals/sales` - Sales Journal screen
- `GET /accounting/journals/purchases` - Purchases Journal screen
- `GET /accounting/journals/assets` - Assets Journal screen
- `GET /accounting/journals/payroll` - Payroll Journal screen
- `GET /accounting/journals/general` - General Journal screen
- `GET /accounting/general-ledger` - General Ledger screen

### Financial Reports

- `GET /accounting/reports/trial-balance` - Trial Balance report
- `GET /accounting/reports/balance-sheet` - Balance Sheet report
- `GET /accounting/reports/profit-loss` - Profit & Loss report
- `GET /accounting/reports/cash-flow` - Cash Flow report

This guide provides everything needed to integrate the accounting endpoints with the frontend journal screens while working effectively with the existing database schema.
