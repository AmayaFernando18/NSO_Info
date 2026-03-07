import { ZodError } from 'zod';

function validateRequest(schema) {
  return (req, _res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next({
          status: 400,
          message: 'Validation failed',
          details: error.issues,
        });
      }
      return next(error);
    }
  };
}

export default validateRequest;
