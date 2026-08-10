import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { changePasswordSchema, updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/me', asyncHandler(userController.me));
router.patch('/me', validate({ body: updateProfileSchema }), asyncHandler(userController.updateProfile));
router.post('/me/password', validate({ body: changePasswordSchema }), asyncHandler(userController.changePassword));
router.delete('/me', asyncHandler(userController.deleteAccount));

export default router;
