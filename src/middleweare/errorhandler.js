import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  console.log(`❌ Error occurred from path ${req.path}`);
  console.error(err); // ✅ Properly logs error

  // Invalid JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON format. Please check your request body.",
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    console.log("❌ Zod validation error",errors);
    const errors = err.issues.map((e) => ({
     
      message: e.message
    }));

    return res.status(400).json({
      message: "Validation error",
      errors
    });
  }

  // Fallback error
  res.status(500).json({
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};
