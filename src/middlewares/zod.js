import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse(req.body);

    req.validatedData = {}; // initialize object
    req.validatedData.body = result;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }

    next(error);
  }
};

export default validate;