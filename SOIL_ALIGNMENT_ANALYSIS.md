# 🌱 Soil Module - Frontend/Backend Alignment Analysis

**Date**: May 18, 2026  
**Status**: ⚠️ MISALIGNMENT DETECTED

---

## 📊 Current State

### Frontend Screens (What's Being Collected)

1. **SoilDataScreen** - Soil characteristics (type, pH, moisture, organic matter, nutrients)
2. **FieldConditionsScreen** - Field properties (topography, drainage, crop residue)
3. **WeatherDataScreen** - Weather data (temperature, precipitation, wind, humidity)
4. **TillageScreen** - Tillage operations (system, primary/secondary tillage)
5. **SoilLandPrepScreen** - Navigation hub for all above

### Backend Endpoints (What Exists)

1. **POST /soil-prep** - Records land preparation/tillage activities
2. **GET /soil-prep?cropId=** - Lists soil prep records + stats
3. **GET /soil-prep/:id** - Get single record
4. **PATCH /soil-prep/:id** - Update record
5. **DELETE /soil-prep/:id** - Delete record

---

## ❌ The Problem

### Misalignment #1: Soil Data

**Frontend Collects**:

- Soil type (sandy, loamy, clay)
- Soil pH (acid, neutral, alkaline)
- Moisture content (dry, moist, wet)
- Organic matter (low, medium, high)
- Nutrients (N, P, K)

**Backend Has**: ❌ NO ENDPOINT

**Impact**: SoilDataScreen data cannot be saved

---

### Misalignment #2: Field Conditions

**Frontend Collects**:

- Topography (flat, sloped, hilly)
- Drainage (well-drained, poorly-drained, waterlogged)
- Previous crop residue (low, medium, high)

**Backend Has**: ❌ NO ENDPOINT

**Impact**: FieldConditionsScreen data cannot be saved

---

### Misalignment #3: Weather Data

**Frontend Collects**:

- Temperature (type, value, note)
- Precipitation (type, value, note)
- Wind (type, value, note)
- Humidity (type, value, note)
- Location name

**Backend Has**: ❌ NO ENDPOINT

**Impact**: WeatherDataScreen data cannot be saved

---

### Alignment #4: Soil Prep/Tillage ✅

**Frontend Collects**:

- System (contour, ridge, strip, terracing, no-till)
- Primary tillage (type, tool, date)
- Secondary tillage (type, tool, date)

**Backend Has**: ✅ POST /soil-prep

**Status**: ALIGNED (but DTO needs adjustment for primary/secondary tillage arrays)

---

## 🔧 What Needs to Be Done

### 1. Create Soil Data Endpoint

**Endpoint**: `POST /soil-data`

**DTO Fields**:

```typescript
{
  cropId: string (required)
  farmId: string (required)
  date: ISO 8601 (required)
  soilType: "sandy" | "loamy" | "clay" (required)
  soilTypeNote: string (optional)
  soilPH: "acid" | "neutral" | "alkaline" (required)
  soilPHNote: string (optional)
  moistureContent: "dry" | "moist" | "wet" (required)
  moistureNote: string (optional)
  organicMatter: "low" | "medium" | "high" (required)
  organicNote: string (optional)
  nitrogen: boolean (optional)
  phosphorus: boolean (optional)
  potassium: boolean (optional)
  nutrientsNote: string (optional)
}
```

**Prisma Model**: Need to create `SoilDataRecord` model

---

### 2. Create Field Conditions Endpoint

**Endpoint**: `POST /field-conditions`

**DTO Fields**:

```typescript
{
  cropId: string (required)
  farmId: string (required)
  date: ISO 8601 (required)
  topography: "flat" | "sloped" | "hilly" (required)
  topographyNote: string (optional)
  drainage: "well-drained" | "poorly-drained" | "waterlogged" (required)
  drainageNote: string (optional)
  previousCropResidue: "low" | "medium" | "high" (required)
  residueNote: string (optional)
}
```

**Prisma Model**: Need to create `FieldConditionRecord` model

---

### 3. Create Weather Data Endpoint

**Endpoint**: `POST /weather-data`

**DTO Fields**:

```typescript
{
  cropId: string (required)
  farmId: string (required)
  date: ISO 8601 (required)
  temperatureType: "current" | "historical" | "forecasted" (required)
  temperatureValue: number (required)
  temperatureNote: string (optional)
  precipitationType: "rainfall-amount" | "rainfall-pattern" | "forecasted-precipitation" (required)
  precipitationValue: number (required)
  precipitationNote: string (optional)
  windType: "current-wind" | "historical-wind" | "forecasted-wind" (required)
  windValue: number (required)
  windNote: string (optional)
  humidityType: "current-humidity" | "historical-humidity" | "forecasted-humidity" (required)
  humidityValue: number (required)
  humidityNote: string (optional)
  locationName: string (optional)
}
```

**Prisma Model**: Need to create `WeatherDataRecord` model

---

### 4. Update Soil Prep DTO

**Current Issue**: DTO doesn't support arrays for primary/secondary tillage

**Needed Changes**:

```typescript
// Current (incorrect)
tillageType: string;

// Needed (correct)
system: "contour" | "ridge" | "strip" | "terracing" | "no-till";
primaryTillage: Array<{
  type: string;
  tool: string;
  date: ISO 8601;
}>;
secondaryTillage: Array<{
  type: string;
  tool: string;
  date: ISO 8601;
}>;
```

---

## 📋 Implementation Checklist

### Phase 1: Create Missing Endpoints

- [ ] Create `SoilDataRecord` Prisma model
- [ ] Create `FieldConditionRecord` Prisma model
- [ ] Create `WeatherDataRecord` Prisma model
- [ ] Create soil-data DTOs (create, update)
- [ ] Create field-conditions DTOs (create, update)
- [ ] Create weather-data DTOs (create, update)
- [ ] Create soil-data controller & service
- [ ] Create field-conditions controller & service
- [ ] Create weather-data controller & service
- [ ] Register all 3 new modules in CropsModule

### Phase 2: Update Existing Endpoints

- [ ] Update soil-prep DTO to support primary/secondary tillage arrays
- [ ] Update soil-prep service to handle new structure
- [ ] Update soil-prep Prisma model if needed

### Phase 3: Frontend Integration

- [ ] Create soil-data service in frontend
- [ ] Create field-conditions service in frontend
- [ ] Create weather-data service in frontend
- [ ] Add API calls to SoilDataScreen
- [ ] Add API calls to FieldConditionsScreen
- [ ] Add API calls to WeatherDataScreen
- [ ] Add API calls to TillageScreen

### Phase 4: Testing

- [ ] Test all endpoints with Swagger
- [ ] Test complete soil data flow
- [ ] Test error handling
- [ ] Test JWT authentication

---

## 🎯 Priority

**HIGH**: Create the 3 missing endpoints (soil-data, field-conditions, weather-data)  
**MEDIUM**: Update soil-prep DTO for primary/secondary tillage  
**LOW**: Frontend integration (can be done in parallel)

---

## 📝 Summary

| Endpoint               | Status     | Action     |
| ---------------------- | ---------- | ---------- |
| POST /soil-data        | ❌ Missing | CREATE     |
| POST /field-conditions | ❌ Missing | CREATE     |
| POST /weather-data     | ❌ Missing | CREATE     |
| POST /soil-prep        | ✅ Exists  | UPDATE DTO |
| GET /soil-prep         | ✅ Exists  | No change  |
| GET /soil-prep/:id     | ✅ Exists  | No change  |
| PATCH /soil-prep/:id   | ✅ Exists  | No change  |
| DELETE /soil-prep/:id  | ✅ Exists  | No change  |

---

**Next Step**: Create the 3 missing endpoints to align with frontend requirements.
