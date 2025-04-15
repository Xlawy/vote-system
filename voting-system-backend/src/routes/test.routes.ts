import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @route   GET /api/test
 * @desc    Test API endpoint
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      status: 'success',
      message: 'API is working',
      data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
