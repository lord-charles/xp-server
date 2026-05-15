# Crops Module API Documentation

Complete API documentation for Phase 1-5 crop management activities.

## Overview

The Crops module provides comprehensive endpoints for managing crop cycles, activities, and tracking. All endpoints require JWT authentication via Bearer token.

### Base URL

```
/api/crops
```

### Authentication

All endpoints require the `Authorization: Bearer <token>` header.

---

## Phase 1: Crop Cycles & Crops

### Crop Cycles

#### Create Cycle

```
POST /cycles
```

Creates a new crop cycle for a farm.

**Request Body:**

```json
{
  "farmId": "clh2x0f3",
  "name": "2026 Main Season",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "landSelection": "entire",
  "landSize": 5,
  "landUnit": "acres",
  "status": "Active"
}
```

#### List Cycles

```
GET /cycles?farmId=clh2x0f3
```

#### Get Single Cycle

```
GET /cycles/:id
```

#### Update Cycle

```
PATCH /cycles/:id
```

#### Delete Cycle

```
DELETE /cycles/:id
```

---

### Crops

#### Create Crop

```
POST /crops
```

Creates a new crop within a cycle.

**Request Body:**

```json
{
  "cycleId": "clx2def",
  "farmId": "clh2x0f3",
  "cropName": "Maize",
  "category": "Cereals",
  "variety": "H614",
  "areaSize": 2.5,
  "areaUnit": "acres",
  "plantingDate": "2026-02-01",
  "expectedHarvestDate": "2026-06-15",
  "status": "Active",
  "notes": "Hybrid variety"
}
```

#### List Crops

```
GET /crops?cycleId=clx2def
```

#### Get Single Crop

```
GET /crops/:id
```

#### Update Crop

```
PATCH /crops/:id
```

#### Delete Crop

```
DELETE /crops/:id
```

---

## Phase 2: Soil Preparation, Tillage, Planting

### Soil Preparation

#### Create Soil Prep Record

```
POST /soil-prep
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-01-15T00:00:00.000Z",
  "tillageType": "Deep ploughing",
  "area": 2.5,
  "areaUnit": "acres",
  "labourType": "machine",
  "labourCost": 5000,
  "notes": "Prepared field for planting"
}
```

#### List Soil Prep Records

```
GET /soil-prep?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalLabourCost": 5000,
    "lastDate": "2026-01-15T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /soil-prep/:id
```

#### Update Record

```
PATCH /soil-prep/:id
```

#### Delete Record

```
DELETE /soil-prep/:id
```

---

### Tillage

#### Create Tillage Record

```
POST /tillage
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-01-20T00:00:00.000Z",
  "system": "Conventional",
  "type": "Primary",
  "equipment": "Tractor",
  "area": 2.5,
  "areaUnit": "acres",
  "cost": 3000,
  "notes": "First pass with tractor"
}
```

#### List Tillage Records

```
GET /tillage?cropId=clx2def
```

#### Get Single Record

```
GET /tillage/:id
```

#### Update Record

```
PATCH /tillage/:id
```

#### Delete Record

```
DELETE /tillage/:id
```

---

### Planting

#### Create Planting Record

```
POST /planting
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "dateOfPlanting": "2026-02-15T00:00:00.000Z",
  "methodOfPlanting": "direct-seeding",
  "seedSource": "recently-acquired",
  "seedVarietyName": "Hybrid 614",
  "sourceOfSeeds": "agronet",
  "seedRatePerHole": "2",
  "spacing": "75 × 30",
  "plantingDepth": "5",
  "quantityPlanted": "12",
  "labourType": "human",
  "numberOfWorkers": 4,
  "labourCost": 3000,
  "notes": "Direct seeding method"
}
```

#### List Planting Records

```
GET /planting?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalSeedsKg": 12,
    "totalLabourCost": 3000,
    "lastDate": "2026-02-15T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /planting/:id
```

#### Update Record

```
PATCH /planting/:id
```

#### Delete Record

```
DELETE /planting/:id
```

---

## Phase 3: Fertilizers, Irrigation, Weeding, Chemicals

### Fertilizers (5-step wizard)

#### Create Fertilizer Record

```
POST /fertilizers
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-03-01T00:00:00.000Z",
  "fertilizerType": "organic",
  "fertilizerSource": "Compost",
  "mode": "basal",
  "applicationDate": "2026-03-01T00:00:00.000Z",
  "applicationMethod": "Broadcasting",
  "applicationTiming": "Before planting",
  "dosage": 50,
  "coverage": 2.5,
  "equipment": "Spreader",
  "labourType": "human",
  "numberOfWorkers": 4,
  "labourCost": 3000,
  "notes": "Organic compost application"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Fertilizer Application"` and advances progress by 5%

#### List Fertilizer Records

```
GET /fertilizers?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalDosageKg": 50,
    "totalLabourCost": 3000,
    "lastDate": "2026-03-01T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /fertilizers/:id
```

#### Update Record

```
PATCH /fertilizers/:id
```

#### Delete Record

```
DELETE /fertilizers/:id
```

---

### Irrigation (4-step form)

#### Create Irrigation Record

```
POST /irrigation
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-03-10T00:00:00.000Z",
  "method": "drip",
  "soilMoisture": "Moist",
  "waterSource": "Borehole",
  "volume": 5000,
  "volumeUnit": "liters",
  "applicationMethod": "Drip line",
  "systemCost": 15000,
  "fuelCost": 2000,
  "labourType": "human",
  "numberOfWorkers": 3,
  "labourCost": 2500,
  "hoursWorked": 4,
  "additionalCharges": 500,
  "notes": "First irrigation"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Irrigation"` and advances progress by 5%

#### List Irrigation Records

```
GET /irrigation?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalVolumeLiters": 5000,
    "totalCost": 19500,
    "lastDate": "2026-03-10T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /irrigation/:id
```

#### Update Record

```
PATCH /irrigation/:id
```

#### Delete Record

```
DELETE /irrigation/:id
```

---

### Weeding (2 sections)

#### Create Weeding Record

```
POST /weeding
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-03-20T00:00:00.000Z",
  "weedingType": "manual",
  "herbicideName": null,
  "dosage": null,
  "applicationMethod": "Hand hoeing",
  "labourType": "human",
  "numberOfWorkers": 5,
  "labourCost": 4000,
  "notes": "Manual weeding"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Weeding"` and advances progress by 5%

#### List Weeding Records

```
GET /weeding?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalLabourCost": 4000,
    "lastDate": "2026-03-20T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /weeding/:id
```

#### Update Record

```
PATCH /weeding/:id
```

#### Delete Record

```
DELETE /weeding/:id
```

---

### Chemicals

#### Create Chemical Record

```
POST /chemicals
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-03-25T00:00:00.000Z",
  "chemicalName": "Insecticide",
  "chemicalType": "Synthetic",
  "dosage": 1.5,
  "dosageUnit": "liters",
  "applicationMethod": "Spraying",
  "labourType": "human",
  "numberOfWorkers": 3,
  "labourCost": 2500,
  "notes": "Pest control spray"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Chemical Application"` and advances progress by 5%

#### List Chemical Records

```
GET /chemicals?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalDosageLiters": 1.5,
    "totalLabourCost": 2500,
    "lastDate": "2026-03-25T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /chemicals/:id
```

#### Update Record

```
PATCH /chemicals/:id
```

#### Delete Record

```
DELETE /chemicals/:id
```

---

## Phase 4: Diseases, Pests, Harvesting, Processing

### Diseases

#### Create Disease Record

```
POST /diseases
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-04-10T00:00:00.000Z",
  "diseaseName": "Leaf Blight",
  "methodOfControl": "chemical",
  "dateOfControl": "2026-04-11T00:00:00.000Z",
  "methodDetail": "Spray fungicide",
  "labourType": "human",
  "numberOfWorkers": 3,
  "labourCost": 2500,
  "notes": "Disease identified and treated"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Disease Control"` and advances progress by 5%

#### List Disease Records

```
GET /diseases?cropId=clx2def
```

#### Get Single Record

```
GET /diseases/:id
```

#### Update Record

```
PATCH /diseases/:id
```

#### Delete Record

```
DELETE /diseases/:id
```

---

### Pests

#### Create Pest Record

```
POST /pests
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-04-15T00:00:00.000Z",
  "pestName": "Armyworm",
  "methodOfControl": "Chemical spray",
  "dateOfControl": "2026-04-16T00:00:00.000Z",
  "methodDetail": "Apply insecticide",
  "labourType": "human",
  "numberOfWorkers": 4,
  "labourCost": 3000,
  "notes": "Pest control completed"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Pest Control"` and advances progress by 5%

#### List Pest Records

```
GET /pests?cropId=clx2def
```

#### Get Single Record

```
GET /pests/:id
```

#### Update Record

```
PATCH /pests/:id
```

#### Delete Record

```
DELETE /pests/:id
```

---

### Harvesting (2-step form)

#### Create Harvesting Record

```
POST /harvesting
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-06-15T00:00:00.000Z",
  "methodOfHarvesting": "machine",
  "typeOfMachine": "Combine harvester",
  "fuelCost": 5000,
  "sourceMachine": "Hired",
  "operatorType": "Operator",
  "sourceLabor": "Hired",
  "workerName": "John Doe",
  "timeWorked": 8,
  "harvestedQuantity": 500,
  "harvestedQuality": "Grade A",
  "meansOfTransport": "Truck",
  "numberOfTrips": 3,
  "costOfTransport": 8000,
  "notes": "Successful harvest"
}
```

**Side Effects:**

- Sets `Crop.currentActivity = "Harvesting"`
- Sets `Crop.progress = 100`

#### List Harvesting Records

```
GET /harvesting?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalQuantityKg": 500,
    "totalCost": 13000,
    "lastDate": "2026-06-15T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /harvesting/:id
```

#### Update Record

```
PATCH /harvesting/:id
```

#### Delete Record

```
DELETE /harvesting/:id
```

---

### Processing (3-step form)

#### Create Processing Record

```
POST /processing
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-06-20T00:00:00.000Z",
  "processingType": "Milling",
  "processingMethod": "Wet milling",
  "equipment": "Hammer mill",
  "labourType": "human",
  "numberOfWorkers": 5,
  "labourCost": 4000,
  "outputQuantity": 450,
  "outputQuality": "Grade A",
  "notes": "Milling completed"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Processing"`

#### List Processing Records

```
GET /processing?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalOutputQuantityKg": 450,
    "totalLabourCost": 4000,
    "lastDate": "2026-06-20T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /processing/:id
```

#### Update Record

```
PATCH /processing/:id
```

#### Delete Record

```
DELETE /processing/:id
```

---

## Phase 5: Losses, Crop Sales, Crop Alerts

### Losses

#### Create Loss Record

```
POST /losses
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-05-10T00:00:00.000Z",
  "lossType": "Weather damage",
  "quantity": 50,
  "quantityUnit": "kg",
  "cause": "Heavy rain",
  "notes": "Crop damaged by heavy rain"
}
```

**Side Effect:** Sets `Crop.currentActivity = "Losses"`

#### List Loss Records

```
GET /losses?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalQuantityKg": 50,
    "lastDate": "2026-05-10T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /losses/:id
```

#### Update Record

```
PATCH /losses/:id
```

#### Delete Record

```
DELETE /losses/:id
```

---

### Crop Sales

#### Create Crop Sale Record

```
POST /crop-sales
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "date": "2026-06-25T00:00:00.000Z",
  "quantity": 500,
  "quantityUnit": "kg",
  "pricePerUnit": 50,
  "buyerName": "John Buyer",
  "paymentMethod": "Cash",
  "notes": "Sold to local buyer"
}
```

**Computed Field:**

- `totalAmount = quantity * pricePerUnit` (500 \* 50 = 25000)

**Side Effect:** Sets `Crop.currentActivity = "Sales"`

#### List Crop Sale Records

```
GET /crop-sales?cropId=clx2def
```

**Response:**

```json
{
  "records": [...],
  "stats": {
    "count": 1,
    "totalQuantityKg": 500,
    "totalRevenue": 25000,
    "averagePricePerUnit": 50,
    "lastDate": "2026-06-25T00:00:00.000Z"
  }
}
```

#### Get Single Record

```
GET /crop-sales/:id
```

#### Update Record

```
PATCH /crop-sales/:id
```

#### Delete Record

```
DELETE /crop-sales/:id
```

---

### Crop Alerts

#### Create Crop Alert

```
POST /crop-alerts
```

**Request Body:**

```json
{
  "cropId": "clx2def",
  "farmId": "clh2x0f3",
  "alertType": "Watering needed",
  "message": "Soil moisture is below 30%",
  "severity": "warning",
  "isRead": false
}
```

#### List Crop Alerts

```
GET /crop-alerts?cropId=clx2def
```

**Response:**

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

#### Get Single Alert

```
GET /crop-alerts/:id
```

#### Update Alert

```
PATCH /crop-alerts/:id
```

#### Mark Single Alert as Read

```
PATCH /crop-alerts/:id/mark-as-read
```

#### Mark All Alerts as Read

```
PATCH /crop-alerts/mark-all-as-read?cropId=clx2def
```

#### Delete Alert

```
DELETE /crop-alerts/:id
```

---

## Error Responses

All endpoints return standard error responses:

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
  "message": ["validation error message"],
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

## Database Schema

All records include:

- `id`: Unique identifier (CUID)
- `cropId`: Reference to crop
- `farmId`: Reference to farm
- `date`: Activity date
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All monetary values are in the farm's local currency
3. Progress is calculated incrementally (each activity adds ~5%)
4. Harvesting sets progress to 100% automatically
5. All endpoints support pagination via query parameters (limit, offset)
6. Alerts can be auto-generated based on crop progress and activities
