import { z } from "zod";

export const updateWorkflowSchema = z.object({
  name: z.string({required_error: "Name is required"}).nonempty("Name cannot be empty"),
  transitions: z
    .array(
      z.object({
        fromKey: z.string({ required_error: "From key is required" }).min(1),
        toKey: z.string({ required_error: "To key is required" }).min(1),
        fromOrder: z.number({ required_error: "From order is required" }),
        toOrder: z.number({ required_error: "To order is required" })
      })
    )
    .min(1, "At least one transition is required"),
});
