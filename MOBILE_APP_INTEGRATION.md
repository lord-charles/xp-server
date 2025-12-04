# Mobile App Sales Integration Guide

## Quick Reference for Frontend Developers

This guide maps each mobile app sales screen to its corresponding backend endpoint.

---

## 1. Beef Cattle Sales Screen

**File:** `app/(screens)/sales/beefcattle/AddBeefCattleScreen.tsx`

**Endpoint:** `POST /sales/beef-cattle`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedLivestock?.id, // optional
  animalId: "A234",
  weight: 550,
  beefQuality: "Medium", // "Low" | "Medium" | "High"
  saleDate: "2025-10-05",
  marketPrice: 80000,
  salePrice: 85000,
  buyerName: "John Doe",
  buyerType: "Individual" // "Individual" | "Company"
}
```

---

## 2. Dairy Cattle Milk Sales Screen

**File:** `app/(screens)/sales/dairycattle/AddDairysalesscreen.tsx`

**Endpoint:** `POST /sales/milk`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedLivestock?.id, // optional
  animalId: "DC001",
  milkYield: 25,
  milkQuality: "Medium", // "Low" | "Medium" | "High"
  milkingDate: "2025-10-05",
  homeUseQuantity: 2,
  saleQuantity: 23, // auto-calculated: milkYield - homeUseQuantity
  saleDate: "2025-10-05",
  marketPrice: 50, // per liter
  salePrice: 55, // per liter
  buyerName: "Jane Doe",
  buyerType: "Individual",
  category: "dairy" // "dairy" for cattle, "goat" for goats
}
```

---

## 3. Goat Milk Sales Screen

**File:** `app/(screens)/sales/goatsales/Addgoatscreen.tsx`

**Endpoint:** `POST /sales/milk`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedGoat?.id, // optional
  animalId: "G001",
  milkYield: 15,
  milkQuality: "Medium",
  milkingDate: "2025-10-05",
  homeUseQuantity: 2,
  saleQuantity: 13,
  saleDate: "2025-10-05",
  marketPrice: 60,
  salePrice: 65,
  buyerName: "John Doe",
  buyerType: "Individual",
  category: "goat" // Important: use "goat" for goat milk
}
```

---

## 4. Swine Sales Screen

**File:** `app/(screens)/sales/swine/AddSwineScreen.tsx`

**Endpoint:** `POST /sales/swine`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedLivestock?.id, // optional
  animalId: "S001",
  saleWeight: 120,
  saleDate: "2025-10-05",
  marketPrice: 300, // per kg
  salePrice: 320, // per kg
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

---

## 5. Sheep Sales Screen (Multi-step)

**File:** `app/(screens)/sales/sheepsale/Addsheepscreen.tsx`

**Endpoint:** `POST /sales/sheep`

### Wool Sale Payload:

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedSheep?.id, // optional
  animalId: "SH001",
  saleType: "wool",
  shearingDate: "2025-10-05",
  woolQuality: "Medium", // "Low" | "Medium" | "High"
  woolWeight: 15.5,
  salePrice: 5000, // total price for wool
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

### Meat Sale Payload:

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedSheep?.id, // optional
  animalId: "SH001",
  saleType: "meat",
  saleWeight: 45,
  saleDate: "2025-10-05",
  marketPrice: 600, // per kg
  salePrice: 650, // per kg
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

---

## 6. Rabbit Sales Screen

**File:** `app/(screens)/sales/rabbit/AddRabbitScreen.tsx`

**Endpoint:** `POST /sales/rabbit`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedLivestock?.id, // optional
  animalId: "R001",
  groupId: "Batch A", // optional
  saleWeight: 3.5,
  saleDate: "2025-10-05",
  marketPrice: 500, // total price
  salePrice: 550, // total price
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

---

## 7. Poultry Sales Screen (Multi-type)

**File:** `app/(screens)/sales/poultry/AddPoultrySalesScreen.tsx`

**Endpoint:** `POST /sales/poultry`

### Broiler Sale Payload:

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedFlock?.id, // optional
  flockId: "FL001",
  saleType: "broiler",
  numberSold: 50,
  saleWeight: 150, // total weight in kg
  saleDate: "2025-10-05",
  marketPrice: 400, // per kg
  salePrice: 450, // per kg
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

### Egg Production Payload:

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedFlock?.id, // optional
  flockId: "FL001",
  saleType: "egg_production",
  productionDate: "2025-10-05",
  numberOfLayers: 200,
  eggCount: 180,
  averageEggWeight: 55 // in grams
}
```

### Egg Sales Payload:

```typescript
{
  farmId: activeFarm.id,
  livestockId: selectedFlock?.id, // optional
  flockId: "FL001",
  saleType: "egg_sales",
  trays: 10,
  numberOfEggs: 300,
  saleDate: "2025-10-05",
  marketPrice: 15, // per egg
  salePrice: 18, // per egg
  buyerName: "John Doe",
  buyerType: "Individual"
}
```

---

## 8. Egg Production Screen (Standalone)

**File:** `app/(screens)/sales/eggs/AddEggProductionScreen.tsx`

**Endpoint:** `POST /sales/egg-production`

**Payload Example:**

```typescript
{
  farmId: activeFarm.id,
  flockId: "L001",
  date: "2025-10-05",
  numberOfLayers: 200,
  eggCount: 180,
  avgEggWeight: 55, // in grams
  gradeA: 150, // optional
  gradeB: 25,  // optional
  gradeC: 5    // optional
}
```

---

## Response Format

All endpoints return a consistent response:

```typescript
{
  success: boolean;
  data: {
    id: string;
    farmId: string;
    category: string;
    status: string;
    price: number;
    saleDate: Date;
    farm: {
      id: string;
      name: string;
      county: string;
      administrativeLocation: string;
    };
    // ... other fields based on sale type
  };
  error?: string; // Only present if success is false
}
```

---

## Error Handling

Handle these common error scenarios:

```typescript
try {
  const response = await createBeefSale(payload);

  if (response.success) {
    Alert.alert('Success', 'Sale recorded successfully!');
    router.back();
  } else {
    Alert.alert('Error', response.error || 'Failed to record sale');
  }
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'An unexpected error occurred');
}
```

---

## Common Validation Rules

1. **Dates:** Must be in YYYY-MM-DD format, cannot be in the future
2. **Prices:** Must be positive numbers
3. **Weights:** Must be positive numbers
4. **Quantities:** Must be positive integers
5. **Buyer Type:** Must be exactly "Individual" or "Company" (case-sensitive)
6. **Quality Levels:** Must be exactly "Low", "Medium", or "High" (case-sensitive)

---

## API Base URL

Development: `http://localhost:3000/api`
Production: `https://your-api-domain.com/api`

---

## Authentication

All requests require a JWT token in the Authorization header:

```typescript
const headers = {
  Authorization: `Bearer ${userToken}`,
  'Content-Type': 'application/json',
};
```

---

## Testing Checklist

For each screen, verify:

- [ ] Form validation works correctly
- [ ] All required fields are sent to backend
- [ ] Optional fields are handled properly
- [ ] Success response shows confirmation
- [ ] Error responses show appropriate messages
- [ ] Navigation works after successful submission
- [ ] Loading states are displayed during API calls
- [ ] Date picker formats dates correctly
- [ ] Number inputs accept decimal values where needed
- [ ] Livestock selection modal works
- [ ] Auto-calculated fields update correctly

---

## Notes

1. The `livestockId` field is optional but recommended when linking to existing livestock records
2. The `animalId` field is the farmer's physical tag/identifier (required)
3. All monetary values are in Kenyan Shillings (Ksh)
4. Weights are in kilograms unless specified otherwise (egg weights are in grams)
5. Dates should be formatted as YYYY-MM-DD strings
6. The backend automatically calculates derived values (e.g., total price, production rates)
