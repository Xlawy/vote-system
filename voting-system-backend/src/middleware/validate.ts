import express, { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: '请求参数验证失败', error: error.message });
      } else {
        res.status(400).json({ message: '请求参数验证失败' });
      }
    }
  };
};
