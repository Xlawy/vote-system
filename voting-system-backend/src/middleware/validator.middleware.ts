import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ErrorResponse } from '../types/auth.types';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const errorResponse: ErrorResponse = {
          message: firstError.message,
          errors: {},
        };
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errorResponse.errors![path]) {
            errorResponse.errors![path] = [];
          }
          errorResponse.errors![path].push(err.message);
        });
        
        console.log('请求体:', req.body);
        console.log('验证错误:', errorResponse);
        
        res.status(400).json(errorResponse);
        return;
      }
      next(error);
    }
  };
};
