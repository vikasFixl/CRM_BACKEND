import { EDITransaction } from "../../models/SCM/EDITransaction.js";

export const createOutboundEdiTransaction = async ({
  organizationId,
  documentType,
  referenceId,
  referenceType,
  payload,
}) => {
  return EDITransaction.create({
    organizationId,
    documentType,
    referenceId,
    referenceType,
    payload,
    direction: "outbound",
    status: "sent",
  });
};

export const createInboundEdiTransaction = async ({
  organizationId,
  documentType,
  referenceId,
  referenceType,
  payload,
}) => {
  return EDITransaction.create({
    organizationId,
    documentType,
    referenceId,
    referenceType,
    payload,
    direction: "inbound",
    status: "received",
  });
};

