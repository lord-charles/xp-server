# Sales API Endpoints - Mobile App Integration

## Overview

This document outlines the specialized sales endpoints created to support the mobile app's sales recording screens. All endpoints are properly mapped to the existing `SaleListing` Prisma model.

## Specialized Endpoints

### 1. Beef Cattle Sales

**Endpoint:** `POST /sales/beef-cattle`

**Frontend Screen:** `AddBeefCattleScreen.tsx`

**Required Fields:**

- `farmId` (string)
- `animalId` (string) - Animal tag/ID number
- `weight` (number) - Weight in kg
- `saleDate` (date) - Sale date
- `marketPrice` (number) - Market price in Ksh
- `salePrice` (number) - Actual sale price in Ksh
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Optional Fields:**

- `livestockId` (string) - Internal livestock record ID
- `beefQuality` (enum: 'Low' | 'Medium' | 'High')

**Response:** Returns created sale listing with farm details

---

### 2. Milk Sales (Dairy Cattle & Goats)

**Endpoint:** `POST /sales/milk`

**Frontend Screens:**

- `AddDairysalesscreen.tsx` (Dairy Cattle)
- `Addgoatscreen.tsx` (Dairy Goats)

**Required Fields:**

- `farmId` (string)
- `animalId` (string)
- `milkYield` (number) - Total milk collected in liters
- `milkQuality` (enum: 'Low' | 'Medium' | 'High')
- `milkingDate` (date)

**Optional Fields:**

- `livestockId` (string)
- `homeUseQuantity` (number) - Liters for home use
- `saleQuantity` (number) - Liters for sale (auto-calculated)
- `saleDate` (date) - When milk was sold
- `marketPrice` (number) - Market price per liter
- `salePrice` (number) - Actual sale price per liter
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')
- `category` (enum: 'dairy' | 'goat') - Distinguishes cattle vs goat milk

**Response:** Returns created milk sale record

---

### 3. Swine Sales

**Endpoint:** `POST /sales/swine`

**Frontend Screen:** `AddSwineScreen.tsx`

**Required Fields:**

- `farmId` (string)
- `animalId` (string)
- `saleWeight` (number) - Weight in kg
- `saleDate` (date)
- `marketPrice` (number) - Price per kg
- `salePrice` (number) - Actual price per kg
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Optional Fields:**

- `livestockId` (string)

**Response:** Returns created swine sale record

---

### 4. Sheep Sales (Wool & Meat)

**Endpoint:** `POST /sales/sheep`

**Frontend Screen:** `Addsheepscreen.tsx`

**Required Fields:**

- `farmId` (string)
- `animalId` (string)
- `saleType` (enum: 'wool' | 'meat')
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Wool Sale Specific:**

- `shearingDate` (date)
- `woolQuality` (enum: 'Low' | 'Medium' | 'High')
- `woolWeight` (number) - Weight in kg
- `salePrice` (number) - Total price for wool

**Meat Sale Specific:**

- `saleWeight` (number) - Weight in kg
- `saleDate` (date)
- `marketPrice` (number) - Price per kg
- `salePrice` (number) - Actual price per kg

**Optional Fields:**

- `livestockId` (string)

**Response:** Returns created sheep sale record

---

### 5. Rabbit Sales

**Endpoint:** `POST /sales/rabbit`

**Frontend Screen:** `AddRabbitScreen.tsx`

**Required Fields:**

- `farmId` (string)
- `animalId` (string)
- `saleWeight` (number) - Weight in kg
- `saleDate` (date)
- `marketPrice` (number) - Total market price
- `salePrice` (number) - Total sale price
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Optional Fields:**

- `livestockId` (string)
- `groupId` (string) - Batch/group identifier

**Response:** Returns created rabbit sale record

---

### 6. Poultry Transactions

**Endpoint:** `POST /sales/poultry`

**Frontend Screen:** `AddPoultrySalesScreen.tsx`

**Required Fields:**

- `farmId` (string)
- `flockId` (string)
- `saleType` (enum: 'broiler' | 'egg_production' | 'egg_sales')

**Broiler Sale Specific:**

- `numberSold` (number) - Number of birds sold
- `saleWeight` (number) - Total weight in kg
- `saleDate` (date)
- `marketPrice` (number) - Price per kg
- `salePrice` (number) - Actual price per kg
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Egg Production Specific:**

- `productionDate` (date)
- `numberOfLayers` (number)
- `eggCount` (number)
- `averageEggWeight` (number) - In grams

**Egg Sales Specific:**

- `trays` (number)
- `numberOfEggs` (number)
- `saleDate` (date)
- `marketPrice` (number) - Price per egg
- `salePrice` (number) - Actual price per egg
- `buyerName` (string)
- `buyerType` (enum: 'Individual' | 'Company')

**Optional Fields:**

- `livestockId` (string)

**Response:** Returns created poultry transaction record

---

### 7. Egg Production Recording

**Endpoint:** `POST /sales/egg-production`

**Frontend Screen:** `AddEggProductionScreen.tsx`

**Required Fields:**

- `farmId` (string)
- `flockId` (string)
- `date` (date)
- `numberOfLayers` (number)
- `eggCount` (number)
- `avgEggWeight` (number) - In grams

**Optional Fields:**

- `gradeA` (number) - Count of Grade A eggs
- `gradeB` (number) - Count of Grade B eggs
- `gradeC` (number) - Count of Grade C eggs

**Response:** Returns created egg production record with calculated metrics

---

## Existing General Endpoints

### Create Sale Listing

**Endpoint:** `POST /sales`

- General-purpose endpoint for creating any type of sale listing
- Supports all livestock categories with full field flexibility

### Get All Sales

**Endpoint:** `GET /sales`

- Paginated list with filtering and sorting
- Query parameters: page, limit, search, farmId, category, status, minPrice, maxPrice, sortBy, sortOrder

### Get Sale by ID

**Endpoint:** `GET /sales/:id`

- Retrieve specific sale listing with farm and owner details

### Update Sale

**Endpoint:** `PATCH /sales/:id`

- Update any sale listing fields

### Update Status

**Endpoint:** `PATCH /sales/:id/status`

- Update sale status (available, reserved, sold)

### Complete Sale

**Endpoint:** `POST /sales/:id/complete`

- Mark sale as completed with buyer and payment details

### Delete Sale

**Endpoint:** `DELETE /sales/:id`

- Delete sale listing (only if not sold)

### Get Statistics

**Endpoint:** `GET /sales/statistics`

- Overview statistics for sales listings

### Get Recent Sales

**Endpoint:** `GET /sales/recent`

- Recently completed sales

---

## Database Schema Mapping

All endpoints map to the `SaleListing` model in Prisma with the following key fields:

```prisma
model SaleListing {
  // Core fields
  id, farmId, name, category, breed, age, weight, price, status, health

  // Identifiers
  animalId, livestockId

  // Quality & Production
  beefQuality, milkQuality, milkYield, milkingDate, homeUseQuantity, saleQuantity

  // Poultry
  quantity, pricePerBird, eggProductionRate

  // Sheep & Goats
  woolYield, milkProductionRate

  // Sale Details
  saleDate, buyerName, buyerContact, buyerType, saleAmount, marketPrice, salePrice

  // Payment
  paymentMethod, receiptNumber, saleNotes, attachments

  // Metadata
  purpose, feedingProgram, pregnancyStatus, notes, images
}
```

---

## Response Format

All specialized endpoints return a consistent response format:

```json
{
  "success": true,
  "data": {
    "id": "sale_123",
    "farmId": "farm_456",
    "category": "beefCattle",
    "status": "sold",
    "price": 85000,
    "saleDate": "2025-10-05T00:00:00.000Z",
    "farm": {
      "id": "farm_456",
      "name": "Green Valley Farm",
      "county": "Kiambu",
      "administrativeLocation": "Kiambu County"
    }
    // ... other fields
  }
}
```

---

## Error Handling

All endpoints include proper error handling:

- **404 Not Found:** Farm or sale listing not found
- **400 Bad Request:** Validation errors or business logic violations
- **401 Unauthorized:** Missing or invalid JWT token
- **500 Internal Server Error:** Unexpected server errors

---

## Authentication

All endpoints require JWT authentication via the `@UseGuards(JwtAuthGuard)` decorator.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Notes

1. All date fields accept ISO 8601 format strings (YYYY-MM-DD)
2. Prices are in Kenyan Shillings (Ksh)
3. Weights are in kilograms (kg) unless specified otherwise
4. The `livestockId` field links to the livestock module when available
5. The `animalId` field is the farmer's physical tag/identifier
6. All specialized endpoints automatically set `status: 'sold'` for completed sales
7. Egg production records are created with `status: 'available'` for inventory tracking
