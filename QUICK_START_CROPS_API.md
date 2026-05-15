# Quick Start Guide - Crops API Phase 3-5

## Setup

### 1. Run Database Migration

```bash
cd prisma
npx prisma migrate dev --name add_phase_3_4_5_crop_activities
npx prisma generate
```

### 2. Start Server

```bash
npm run start:dev
```

### 3. Access Swagger UI

```
http://localhost:3000/api/docs
```

---

## Common Request Pattern

All requests require JWT authentication:

```bash
curl -X POST http://localhost:3000/api/fertilizers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cropId": "clx2def",
    "farmId": "clh2x0f3",
    "date": "2026-03-01T00:00:00.000Z",
    "fertilizerType": "organic",
    "mode": "basal",
    "dosage": 50
  }'
```

---

## Phase 3 Quick Reference

### Fertilizers

```bash
# Create
POST /fertilizers

# List
GET /fertilizers?cropId=clx2def

# Get
GET /fertilizers/:id

# Update
PATCH /fertilizers/:id

# Delete
DELETE /fertilizers/:id
```

### Irrigation

```bash
POST /irrigation
GET /irrigation?cropId=clx2def
GET /irrigation/:id
PATCH /irrigation/:id
DELETE /irrigation/:id
```

### Weeding

```bash
POST /weeding
GET /weeding?cropId=clx2def
GET /weeding/:id
PATCH /weeding/:id
DELETE /weeding/:id
```

### Chemicals

```bash
POST /chemicals
GET /chemicals?cropId=clx2def
GET /chemicals/:id
PATCH /chemicals/:id
DELETE /chemicals/:id
```

---

## Phase 4 Quick Reference

### Diseases

```bash
POST /diseases
GET /diseases?cropId=clx2def
GET /diseases/:id
PATCH /diseases/:id
DELETE /diseases/:id
```

### Pests

```bash
POST /pests
GET /pests?cropId=clx2def
GET /pests/:id
PATCH /pests/:id
DELETE /pests/:id
```

### Harvesting

```bash
POST /harvesting
GET /harvesting?cropId=clx2def
GET /harvesting/:id
PATCH /harvesting/:id
DELETE /harvesting/:id
```

### Processing

```bash
POST /processing
GET /processing?cropId=clx2def
GET /processing/:id
PATCH /processing/:id
DELETE /processing/:id
```

---

## Phase 5 Quick Reference

### Losses

```bash
POST /losses
GET /losses?cropId=clx2def
GET /losses/:id
PATCH /losses/:id
DELETE /losses/:id
```

### Crop Sales

```bash
POST /crop-sales
GET /crop-sales?cropId=clx2def
GET /crop-sales/:id
PATCH /crop-sales/:id
DELETE /crop-sales/:id
```

### Crop Alerts

```bash
POST /crop-alerts
GET /crop-alerts?cropId=clx2def
GET /crop-alerts/:id
PATCH /crop-alerts/:id
PATCH /crop-alerts/:id/mark-as-read
PATCH /crop-alerts/mark-all-as-read?cropId=clx2def
DELETE /crop-alerts/:id
```

---

## Example Workflows

### Complete Crop Lifecycle

```bash
# 1. Create Cycle
POST /cycles
{
  "farmId": "clh2x0f3",
  "name": "2026 Main Season",
  "startDate": "2026-01-01",
  "landSelection": "entire",
  "landSize": 5
}

# 2. Create Crop
POST /crops
{
  "cycleId": "cycle-id",
  "farmId": "clh2x0f3",
  "cropName": "Maize",
  "areaSize": 2.5,
  "plantingDate": "2026-02-01",
  "expectedHarvestDate": "2026-06-15"
}

# 3. Soil Prep
POST /soil-prep
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-01-15",
  "tillageType": "Deep ploughing"
}

# 4. Tillage
POST /tillage
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-01-20",
  "system": "Conventional",
  "type": "Primary"
}

# 5. Planting
POST /planting
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "dateOfPlanting": "2026-02-15",
  "methodOfPlanting": "direct-seeding",
  "quantityPlanted": "12"
}

# 6. Fertilizer
POST /fertilizers
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-03-01",
  "fertilizerType": "organic",
  "mode": "basal",
  "dosage": 50
}

# 7. Irrigation
POST /irrigation
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-03-10",
  "method": "drip",
  "volume": 5000
}

# 8. Weeding
POST /weeding
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-03-20",
  "weedingType": "manual"
}

# 9. Disease Control
POST /diseases
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-04-10",
  "diseaseName": "Leaf Blight",
  "methodOfControl": "chemical"
}

# 10. Pest Control
POST /pests
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-04-15",
  "pestName": "Armyworm",
  "methodOfControl": "Chemical spray"
}

# 11. Harvesting (sets progress to 100%)
POST /harvesting
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-06-15",
  "methodOfHarvesting": "machine",
  "harvestedQuantity": 500
}

# 12. Processing
POST /processing
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-06-20",
  "processingType": "Milling",
  "outputQuantity": 450
}

# 13. Record Losses
POST /losses
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-05-10",
  "lossType": "Weather damage",
  "quantity": 50
}

# 14. Record Sales
POST /crop-sales
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "date": "2026-06-25",
  "quantity": 500,
  "pricePerUnit": 50,
  "buyerName": "John Buyer"
}

# 15. Create Alert
POST /crop-alerts
{
  "cropId": "crop-id",
  "farmId": "clh2x0f3",
  "alertType": "Watering needed",
  "message": "Soil moisture is below 30%",
  "severity": "warning"
}
```

---

## Response Examples

### List with Stats

```json
{
  "records": [
    {
      "id": "clx2def123",
      "cropId": "clx2def",
      "farmId": "clh2x0f3",
      "date": "2026-03-01T00:00:00.000Z",
      "fertilizerType": "organic",
      "mode": "basal",
      "dosage": 50,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "count": 1,
    "totalDosageKg": 50,
    "totalLabourCost": 3000,
    "lastDate": "2026-03-01T00:00:00.000Z"
  }
}
```

### Crop Sales with Computed Field

```json
{
  "id": "clx2def456",
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-06-25T00:00:00.000Z",
  "quantity": 500,
  "quantityUnit": "kg",
  "pricePerUnit": 50,
  "totalAmount": 25000,
  "buyerName": "John Buyer",
  "paymentMethod": "Cash",
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

### Crop Alerts Stats

```json
{
  "records": [...],
  "stats": {
    "count": 5,
    "unreadCount": 2,
    "criticalCount": 1
  }
}
```

---

## Error Handling

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Crop clx2def not found",
  "error": "Not Found"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "date must be a valid ISO 8601 date string",
    "dosage must be a number"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Progress Tracking

### Progress Values

- After Soil Prep: 5%
- After Tillage: 10%
- After Planting: 15%
- After Fertilizer: 20%
- After Irrigation: 25%
- After Weeding: 30%
- After Chemicals: 35%
- After Disease Control: 40%
- After Pest Control: 45%
- After Harvesting: 100% (automatic)

### Current Activity Values

- "Soil Preparation"
- "Tillage"
- "Planting"
- "Fertilizer Application"
- "Irrigation"
- "Weeding"
- "Chemical Application"
- "Disease Control"
- "Pest Control"
- "Harvesting"
- "Processing"
- "Losses"
- "Sales"

---

## Testing with cURL

### Get All Fertilizer Records

```bash
curl -X GET "http://localhost:3000/api/fertilizers?cropId=clx2def" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Fertilizer Record

```bash
curl -X POST "http://localhost:3000/api/fertilizers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cropId": "clx2def",
    "farmId": "clh2x0f3",
    "date": "2026-03-01T00:00:00.000Z",
    "fertilizerType": "organic",
    "fertilizerSource": "Compost",
    "mode": "basal",
    "dosage": 50,
    "coverage": 2.5,
    "labourType": "human",
    "numberOfWorkers": 4,
    "labourCost": 3000
  }'
```

### Update Fertilizer Record

```bash
curl -X PATCH "http://localhost:3000/api/fertilizers/clx2def123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dosage": 60,
    "labourCost": 3500
  }'
```

### Delete Fertilizer Record

```bash
curl -X DELETE "http://localhost:3000/api/fertilizers/clx2def123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Issue: "Crop not found"

**Solution:** Verify the cropId exists and belongs to the correct farm.

### Issue: "Unauthorized"

**Solution:** Ensure JWT token is valid and included in Authorization header.

### Issue: Validation errors

**Solution:** Check DTO requirements - all required fields must be provided with correct types.

### Issue: Progress not advancing

**Solution:** Verify the create endpoint is being called (not just update). Progress is set during creation.

---

## Documentation Files

- `CROPS_API_DOCUMENTATION.md` - Complete API reference
- `PHASE_3_4_5_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `QUICK_START_CROPS_API.md` - This file

---

## Support

For issues or questions:

1. Check Swagger UI at `/api/docs`
2. Review CROPS_API_DOCUMENTATION.md
3. Check implementation summary for module details
4. Verify JWT token validity
5. Check database migration status
