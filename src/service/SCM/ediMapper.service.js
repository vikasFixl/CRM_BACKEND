export const mapPurchaseOrderTo850 = (purchaseOrder) => ({
  documentType: "850",
  orderNumber: purchaseOrder.orderNumber,
  vendorId: purchaseOrder.vendorId,
  items: purchaseOrder.items?.map((i) => ({
    skuId: i.skuId,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  })),
  orderDate: purchaseOrder.orderDate,
});

export const mapShipmentTo856 = (shipment) => ({
  documentType: "856",
  shipmentId: shipment._id,
  orderId: shipment.orderId,
  carrier: shipment.carrier,
  trackingNumber: shipment.trackingNumber,
  status: shipment.status,
});

export const mapInboundDocument = (documentType, payload) => ({
  documentType,
  payload,
});

