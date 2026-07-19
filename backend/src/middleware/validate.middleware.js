import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      const formattedErrors = error.issues?.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })) || error.errors;
      return next(new ApiError(400, "Validation Error", formattedErrors));
    }
    next(error);
  }
};
