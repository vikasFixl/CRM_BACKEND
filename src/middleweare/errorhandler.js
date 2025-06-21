import { ZodError } from "zod";
// import { HTTPSTATUS } from "../config/http.config.js";

const formatedZodError = (err, res) => {
  const errors = err.issues.map((error) => ({
    field: error.path.join("."),
    message: error.message,
  }));
  return res
    .status(400)
    .json({ message: "validation error", errors: errors });
};
export const errorHandler = (err, req, res, next) => {
  console.log(`error occured from path ${req.path}`, err);
  // handles json parse error
  if (err instanceof SyntaxError)
    return res
      .status(400)
      .json({ message: "Invalid JSON format.please check your request body" });

  // handles zod errror
  if (err instanceof ZodError) {
    return formatedZodError(err, res);
  }

  res.status(500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : "server error",
  });
};
