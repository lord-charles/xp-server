-- Phase 3: Fertilizers, Irrigation, Weeding, Chemicals
CREATE TABLE "FertilizerRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "fertilizerType" TEXT NOT NULL,
    "fertilizerSource" TEXT,
    "mode" TEXT NOT NULL,
    "applicationDate" DATETIME,
    "applicationMethod" TEXT,
    "applicationTiming" TEXT,
    "dosage" REAL,
    "dosageUnit" TEXT NOT NULL DEFAULT 'kg',
    "coverage" REAL,
    "coverageUnit" TEXT NOT NULL DEFAULT 'acres',
    "equipment" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FertilizerRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "FertilizerRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "FertilizerRecord_cropId_idx" ON "FertilizerRecord"("cropId");
CREATE INDEX "FertilizerRecord_farmId_idx" ON "FertilizerRecord"("farmId");

CREATE TABLE "IrrigationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "method" TEXT NOT NULL,
    "soilMoisture" TEXT,
    "waterSource" TEXT,
    "volume" REAL,
    "volumeUnit" TEXT NOT NULL DEFAULT 'liters',
    "applicationMethod" TEXT,
    "systemCost" REAL,
    "fuelCost" REAL,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "hoursWorked" REAL,
    "additionalCharges" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IrrigationRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "IrrigationRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "IrrigationRecord_cropId_idx" ON "IrrigationRecord"("cropId");
CREATE INDEX "IrrigationRecord_farmId_idx" ON "IrrigationRecord"("farmId");

CREATE TABLE "WeedingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "weedingType" TEXT NOT NULL,
    "herbicideName" TEXT,
    "dosage" REAL,
    "dosageUnit" TEXT NOT NULL DEFAULT 'liters',
    "applicationMethod" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeedingRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "WeedingRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "WeedingRecord_cropId_idx" ON "WeedingRecord"("cropId");
CREATE INDEX "WeedingRecord_farmId_idx" ON "WeedingRecord"("farmId");

CREATE TABLE "ChemicalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "chemicalName" TEXT NOT NULL,
    "chemicalType" TEXT,
    "dosage" REAL,
    "dosageUnit" TEXT NOT NULL DEFAULT 'liters',
    "applicationMethod" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChemicalRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "ChemicalRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "ChemicalRecord_cropId_idx" ON "ChemicalRecord"("cropId");
CREATE INDEX "ChemicalRecord_farmId_idx" ON "ChemicalRecord"("farmId");

-- Phase 4: Diseases, Pests, Harvesting, Processing
CREATE TABLE "DiseaseRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "methodOfControl" TEXT NOT NULL,
    "dateOfControl" DATETIME,
    "methodDetail" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiseaseRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "DiseaseRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "DiseaseRecord_cropId_idx" ON "DiseaseRecord"("cropId");
CREATE INDEX "DiseaseRecord_farmId_idx" ON "DiseaseRecord"("farmId");

CREATE TABLE "PestRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "pestName" TEXT NOT NULL,
    "methodOfControl" TEXT NOT NULL,
    "dateOfControl" DATETIME,
    "methodDetail" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PestRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "PestRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "PestRecord_cropId_idx" ON "PestRecord"("cropId");
CREATE INDEX "PestRecord_farmId_idx" ON "PestRecord"("farmId");

CREATE TABLE "HarvestingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "methodOfHarvesting" TEXT NOT NULL,
    "typeOfMachine" TEXT,
    "fuelCost" REAL,
    "sourceMachine" TEXT,
    "operatorType" TEXT,
    "sourceLabor" TEXT,
    "workerName" TEXT,
    "timeWorked" REAL,
    "harvestedQuantity" REAL,
    "harvestedQuantityUnit" TEXT NOT NULL DEFAULT 'kg',
    "harvestedQuality" TEXT,
    "meansOfTransport" TEXT,
    "numberOfTrips" INTEGER,
    "costOfTransport" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HarvestingRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "HarvestingRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "HarvestingRecord_cropId_idx" ON "HarvestingRecord"("cropId");
CREATE INDEX "HarvestingRecord_farmId_idx" ON "HarvestingRecord"("farmId");

CREATE TABLE "ProcessingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "processingType" TEXT NOT NULL,
    "processingMethod" TEXT,
    "equipment" TEXT,
    "labourType" TEXT,
    "numberOfWorkers" INTEGER,
    "labourCost" REAL,
    "outputQuantity" REAL,
    "outputQuantityUnit" TEXT NOT NULL DEFAULT 'kg',
    "outputQuality" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProcessingRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "ProcessingRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "ProcessingRecord_cropId_idx" ON "ProcessingRecord"("cropId");
CREATE INDEX "ProcessingRecord_farmId_idx" ON "ProcessingRecord"("farmId");

-- Phase 5: Losses, Crop Sales, Crop Alerts
CREATE TABLE "LossRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "lossType" TEXT NOT NULL,
    "quantity" REAL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'kg',
    "cause" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LossRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "LossRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "LossRecord_cropId_idx" ON "LossRecord"("cropId");
CREATE INDEX "LossRecord_farmId_idx" ON "LossRecord"("farmId");

CREATE TABLE "CropSaleRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quantity" REAL NOT NULL,
    "quantityUnit" TEXT NOT NULL DEFAULT 'kg',
    "pricePerUnit" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "buyerName" TEXT,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CropSaleRecord_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "CropSaleRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "CropSaleRecord_cropId_idx" ON "CropSaleRecord"("cropId");
CREATE INDEX "CropSaleRecord_farmId_idx" ON "CropSaleRecord"("farmId");

CREATE TABLE "CropAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cropId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CropAlert_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE,
    CONSTRAINT "CropAlert_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE
);

CREATE INDEX "CropAlert_cropId_idx" ON "CropAlert"("cropId");
CREATE INDEX "CropAlert_farmId_idx" ON "CropAlert"("farmId");
