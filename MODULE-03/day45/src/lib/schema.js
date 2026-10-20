import { z } from "zod";

export const orderItemSchema = z.object({
  slug: z.string().trim().min(1, "Dish slug is required"),
  name: z.string().trim().min(1, "Dish name is required"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative("Price must be zero or more"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
});

export const orderSchema = z
  .object({
    name: z.string().trim().min(2, "Recipient name is required"),
    phone: z
      .string()
      .regex(/^\d{9,10}$/, "Enter a valid 9–10 digit mobile number"),
    email: z.string().email("Enter a valid email for the digital receipt"),
    subcity: z.string().trim().min(1, "Choose a sub-city"),
    street: z
      .string()
      .trim()
      .min(5, "Enter your street, building and flat number"),
    landmark: z.string().trim().min(3, "Add a landmark or gate instruction"),
    timing: z.enum(["immediate", "schedule"], {
      errorMap: () => ({ message: "Choose a dispatch timing" }),
    }),
    scheduleTime: z.string().trim().optional(),
    payment: z.enum(["telebirr", "cbe", "cash", "amole"], {
      errorMap: () => ({ message: "Choose a payment method" }),
    }),
    telebirrPhone: z.string().trim().optional(),
    items: z.array(orderItemSchema).min(1, "Your mesob is empty — add a dish"),
  })
  .superRefine((data, ctx) => {
    if (data.timing === "schedule" && !data.scheduleTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduleTime"],
        message: "Choose a dispatch time",
      });
    }
    if (
      data.payment === "telebirr" &&
      !/^\d{9,10}$/.test(data.telebirrPhone || "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telebirrPhone"],
        message: "Enter a valid 9–10 digit Telebirr number",
      });
    }
  });

export function fieldErrorsOf(error) {
  return error.flatten().fieldErrors;
}
