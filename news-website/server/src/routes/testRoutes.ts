import { Router } from 'express';
import { testEmail } from '../controllers/testController';

const router = Router();

/**
 * @route   POST /api/v1/test/email
 * @desc    Test email sending
 * @access  Public
 */
router.post('/email', testEmail);

export default router;
