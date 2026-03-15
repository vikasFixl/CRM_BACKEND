**Overview**
This document covers Phase 2 SCM operational APIs for Vendors, Purchase Orders, and Inventory. All endpoints are mounted under `\/api\/v1\/scm` and require authenticated user and organization context via cookies (`isAuthenticated` and `authenticateOrgToken`).

**Response Shape**
All successful responses use:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human readable message",
  "data": {}
}
```

Errors use the global error handler and `ApiError`.

**Vendor APIs**
1. `POST /api/v1/scm/vendors`
Request body:
```json
{
  "name": "Acme Supplies",
  "vendorCode": "ACME-001",
  "email": "ops@acme.com",
  "phone": "+1-555-222-1111",
  "taxId": "TAX-9988",
  "address": {
    "line1": "100 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "US"
  }
}
```
Response:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Vendor created successfully",
  "data": { "id": "..." }
}
```
Business logic:
1. `organizationId` is taken from the org token.
2. Vendor is created.
3. Audit log is written.

1. `GET /api/v1/scm/vendors`
Query params: `page`, `limit`, `isActive`.
Response: paginated list.

1. `GET /api/v1/scm/vendors/:id`
Business logic: fetches vendor scoped by `organizationId`.

1. `PATCH /api/v1/scm/vendors/:id`
Business logic:
1. Updates vendor (only within org scope).
2. Writes audit log with changed fields.

1. `DELETE /api/v1/scm/vendors/:id`
Business logic:
1. Deletes vendor (org scoped).
2. Writes audit log.

**Purchase Order APIs**
1. `POST /api/v1/scm/purchase-orders`
Request body:
```json
{
  "vendorId": "ObjectId",
  "warehouseId": "ObjectId",
  "orderNumber": "PO-1001",
  "expectedDeliveryDate": "2026-03-20T00:00:00.000Z",
  "items": [
    {
      "skuId": "ObjectId",
      "productId": "ObjectId",
      "variantId": "ObjectId",
      "quantity": 10,
      "unitPrice": 25
    }
  ],
  "notes": "Urgent delivery"
}
```
Business logic:
1. Creates PO in `draft` status.
2. Writes audit log.

1. `GET /api/v1/scm/purchase-orders`
Query params: `page`, `limit`, `status`, `vendorId`, `orderNumber`.

1. `GET /api/v1/scm/purchase-orders/:id`
Fetches a single PO scoped by `organizationId`.

1. `PATCH /api/v1/scm/purchase-orders/:id`
Business logic:
1. Only `draft` orders can be updated.
2. Writes audit log.

1. `POST /api/v1/scm/purchase-orders/:id/approve`
Business logic:
1. `draft` → `approved`.
2. Writes audit log.

1. `POST /api/v1/scm/purchase-orders/:id/receive`
Request body (optional partial receipt):
```json
{
  "items": [
    { "skuId": "ObjectId", "receivedQuantity": 10 }
  ]
}
```
Business logic:
1. `approved` → `received`.
2. For each item, updates or creates Inventory.
3. Creates InventoryMovement entries with `movementType: PURCHASE`.
4. Writes audit log.

**Inventory APIs**
1. `GET /api/v1/scm/inventory`
Query params: `page`, `limit`, `skuId`, `warehouseId`.

1. `GET /api/v1/scm/inventory/:skuId`
Returns all inventory rows for a given SKU within the org.

1. `POST /api/v1/scm/inventory/adjust`
Request body:
```json
{
  "skuId": "ObjectId",
  "warehouseId": "ObjectId",
  "quantity": 5,
  "note": "Manual stock correction"
}
```
Business logic:
1. If inventory exists, increments `quantityAvailable` by `quantity`.
2. If inventory does not exist, creates a new record.
3. Creates InventoryMovement with `movementType: ADJUSTMENT`.
4. Writes audit log.

**Order APIs (Phase 3)**
1. `POST /api/v1/scm/orders`
Request body:
```json
{
  "orderNumber": "SO-1001",
  "warehouseId": "ObjectId",
  "customerId": "ObjectId",
  "items": [
    {
      "skuId": "ObjectId",
      "productId": "ObjectId",
      "variantId": "ObjectId",
      "quantity": 2,
      "unitPrice": 100
    }
  ],
  "notes": "Handle with care"
}
```
Response shape:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created",
  "data": {}
}
```
Status transition: `created`
Audit log: `ORDER_CREATED`

1. `GET /api/v1/scm/orders`
Query params: `page`, `limit`, `status`, `orderNumber`, `customerId`.

1. `GET /api/v1/scm/orders/:id`
Fetches an order scoped by `organizationId`.

1. `POST /api/v1/scm/orders/:id/confirm`
Business logic:
1. Valid only when status is `created`.
2. For each item, verify `quantityAvailable - quantityReserved >= quantity`.
3. If insufficient, throw `ApiError`.
4. If sufficient, increment `quantityReserved` per item.
5. Set status to `confirmed`.
Audit log: `ORDER_CONFIRMED`

1. `POST /api/v1/scm/orders/:id/pick`
Status transition: `confirmed` → `picking`.
Audit log: `ORDER_PICKED`

1. `POST /api/v1/scm/orders/:id/pack`
Status transition: `picking` → `packed`.
Audit log: `ORDER_PACKED`

1. `POST /api/v1/scm/orders/:id/cancel`
Status transition: `created|confirmed` → `cancelled`.
If confirmed, release reservation by decrementing `quantityReserved`.
Audit log: `ORDER_CANCELLED`

**Shipment APIs (Phase 3)**
1. `POST /api/v1/scm/shipments`
Request body:
```json
{
  "orderId": "ObjectId",
  "warehouseId": "ObjectId",
  "carrier": "DHL",
  "trackingNumber": "DHL-TRACK-001"
}
```
Business logic:
1. Creates shipment in `pending` state.
2. Does not change order status.
Audit log: `SHIPMENT_CREATED`

1. `POST /api/v1/scm/shipments/:id/dispatch`
Business logic:
1. Valid only when order status is `packed`.
2. Prevent duplicate dispatch if shipment status is already `shipped`.
3. Update inventory:
   - `quantityAvailable -= quantity`
   - `quantityReserved -= quantity`
4. Create InventoryMovement per item:
   - `movementType: SALE`
   - `referenceType: Order`
5. Update order status `packed` → `shipped`.
6. Update shipment status `pending` → `shipped`.
Audit logs:
- `ORDER_SHIPPED`
- `SHIPMENT_DISPATCHED`

**Common Errors**
- `401` Organization context missing.
- `400` Invalid status transition.
- `400` Insufficient inventory.
- `404` Resource not found.

**Phase 4: WMS (Picking, Locations, Returns)**
**Picking Workflow**
Status flow: `pending` → `assigned` → `picking` → `completed`.

1. `POST /api/v1/scm/picking-lists`
Request body:
```json
{
  "orderId": "ObjectId",
  "warehouseId": "ObjectId",
  "items": [
    { "skuId": "ObjectId", "locationId": "ObjectId", "quantity": 2 }
  ]
}
```
Behavior:
1. Creates picking list in `pending`.
2. Sets `pickedQuantity = 0` for all items.
3. Audit log `PICKING_LIST_CREATED`.

1. `POST /api/v1/scm/picking-lists/:id/assign`
Request body:
```json
{ "pickerId": "ObjectId" }
```
Behavior:
1. Status `pending` → `assigned`.
2. Audit log `PICKER_ASSIGNED`.

1. `POST /api/v1/scm/picking-lists/:id/pick`
Request body:
```json
{ "skuId": "ObjectId", "quantity": 1 }
```
Behavior:
1. Validates bin inventory.
2. Increments `pickedQuantity`.
3. Sets status to `picking`.
4. If all items picked, sets `completed`.
5. Audit log `ITEM_PICKED` (and `PICKING_COMPLETED` if fully picked).

1. `POST /api/v1/scm/picking-lists/:id/complete`
Behavior:
1. Verifies all items picked.
2. Sets status `completed`.
3. Audit log `PICKING_COMPLETED`.

**Warehouse Location Structure**
Fields:
- `warehouseId`
- `zone`
- `rack`
- `bin`
- `capacity`
- `organizationId`

1. `GET /api/v1/scm/warehouse-locations`
Query params: `warehouseId`, `page`, `limit`.

1. `POST /api/v1/scm/warehouse-locations`
Request body:
```json
{
  "warehouseId": "ObjectId",
  "zone": "A",
  "rack": "R1",
  "bin": "B03",
  "capacity": 100
}
```
Behavior: creates a location; if `locationCode` not supplied it is auto-built from `zone-rack-bin`.

1. `PATCH /api/v1/scm/warehouse-locations/:id`
Updates any of the fields above.

**Return Workflow**
Statuses: `requested`, `approved`, `received`, `rejected`, `restocked`.

1. `POST /api/v1/scm/returns`
Request body:
```json
{
  "orderId": "ObjectId",
  "reason": "Damaged",
  "items": [
    { "skuId": "ObjectId", "quantity": 1 }
  ]
}
```
Audit log: `RETURN_REQUESTED`.

1. `POST /api/v1/scm/returns/:id/approve`
Behavior:
1. `requested` → `approved`.
2. Audit log `RETURN_APPROVED`.

1. `POST /api/v1/scm/returns/:id/receive`
Request body:
```json
{ "warehouseId": "ObjectId" }
```
Behavior:
1. Adds quantity back to inventory.
2. Creates InventoryMovement with `movementType = RETURN`.
3. Status → `received`.
4. Audit log `RETURN_RECEIVED`.

**Phase 5: Supply Chain Planning**
**Forecast Logic**
- Uses last 30 days of shipped/delivered order history.
- Average daily sales = total sales / 30.
- Forecast for next 30 days = average * 30 (equal to total last 30).
- Stored in `DemandForecast` with `generatedAt`.

Endpoints:
1. `POST /api/v1/scm/forecast/run`
Runs forecast, generates/upserts `DemandForecast` records, and creates replenishment suggestions if needed.
Audit log: `FORECAST_GENERATED`.

1. `GET /api/v1/scm/forecast`
Query params: `page`, `limit`, `period`.

1. `GET /api/v1/scm/forecast/:skuId`

**Replenishment Logic**
- Compares forecast demand vs available + incoming.
- If shortage > 0, creates `ReplenishmentSuggestion`.
Audit log: `REPLENISHMENT_SUGGESTED`.

1. `GET /api/v1/scm/replenishment`
Query params: `page`, `limit`, `status`, `skuId`.

1. `POST /api/v1/scm/replenishment/:id/approve`
Request body:
```json
{ "vendorId": "ObjectId", "warehouseId": "ObjectId" }
```
Behavior:
1. Creates Purchase Order with status `draft`.
2. Updates suggestion status → `converted_to_po`.
Audit log: `REPLENISHMENT_APPROVED`.

1. `POST /api/v1/scm/replenishment/:id/reject`
Sets suggestion status → `rejected`.

**Stock Transfer Logic**
Status flow: `requested` → `in_transit` → `completed`.

1. `POST /api/v1/scm/stock-transfers`
Request body:
```json
{
  "skuId": "ObjectId",
  "sourceWarehouseId": "ObjectId",
  "destinationWarehouseId": "ObjectId",
  "quantity": 50
}
```
Audit log: `STOCK_TRANSFER_CREATED`.

1. `GET /api/v1/scm/stock-transfers`
Query params: `page`, `limit`, `status`, `skuId`.

1. `POST /api/v1/scm/stock-transfers/:id/approve`
Sets status → `in_transit`.

1. `POST /api/v1/scm/stock-transfers/:id/complete`
Behavior:
1. Creates InventoryMovement `TRANSFER_OUT` from source.
2. Creates InventoryMovement `TRANSFER_IN` to destination.
3. Updates inventory quantities.
4. Status → `completed`.
Audit log: `STOCK_TRANSFER_COMPLETED`.

**Phase 6: Enterprise Intelligence**
**Supplier Analytics**
Metrics:
- totalOrders
- onTimeDeliveries
- lateDeliveries
- averageLeadTime
- defectRate
- fulfillmentRate
- performanceScore

Scoring (deterministic):
- on-time rate (40%)
- fulfillment rate (40%)
- lead time score (20%)
- defect penalty (if available)

Endpoints:
1. `POST /api/v1/scm/supplier-analytics/run`
Generates or refreshes analytics per vendor for the last 30 days.
Audit log: `SUPPLIER_ANALYTICS_GENERATED`.

1. `GET /api/v1/scm/supplier-analytics`
Query params: `page`, `limit`, `period`.

1. `GET /api/v1/scm/supplier-analytics/:vendorId`

**Real-Time Logistics Tracking**
Endpoints:
1. `GET /api/v1/scm/tracking/:shipmentId`
Returns tracking history for a shipment.

1. `POST /api/v1/scm/tracking/webhook`
Payload fields:
```json
{
  "shipmentId": "ObjectId",
  "trackingNumber": "DHL-TRACK-001",
  "carrier": "DHL",
  "status": "in_transit",
  "location": "Delhi Hub"
}
```
Behavior:
1. Stores ShipmentTracking event.
2. Updates Shipment status when applicable.
Audit log: `SHIPMENT_TRACKED`.

**Global Inventory Visibility**
Endpoints:
1. `GET /api/v1/scm/global-inventory`
Aggregates inventory across warehouses and stores snapshot.
Audit log: `GLOBAL_INVENTORY_REFRESHED`.

1. `GET /api/v1/scm/global-inventory/:skuId`

**EDI Integration**
Endpoints:
1. `POST /api/v1/scm/edi/send`
Payload:
```json
{
  "documentType": "850",
  "referenceId": "ObjectId",
  "referenceType": "PurchaseOrder"
}
```
Audit log: `EDI_DOCUMENT_SENT`.

1. `POST /api/v1/scm/edi/receive`
Payload:
```json
{
  "documentType": "855",
  "referenceId": "ObjectId",
  "referenceType": "PurchaseOrder",
  "payload": { "ack": "accepted" }
}
```
Audit log: `EDI_DOCUMENT_RECEIVED`.

1. `GET /api/v1/scm/edi`
1. `GET /api/v1/scm/edi/:id`

**Supplier Portal**
Endpoints:
1. `GET /api/v1/scm/supplier/orders?vendorId=ObjectId`
2. `POST /api/v1/scm/supplier/orders/:id/confirm`
```json
{ "vendorId": "ObjectId" }
```
3. `POST /api/v1/scm/supplier/shipments`
```json
{
  "orderId": "ObjectId",
  "vendorId": "ObjectId",
  "warehouseId": "ObjectId",
  "carrier": "DHL",
  "trackingNumber": "DHL-TRACK-001"
}
```
Logs key supplier actions for auditing.
