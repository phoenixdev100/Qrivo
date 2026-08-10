import { Router } from 'express';
import { folderController } from '../controllers/folder.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  createFolderSchema,
  folderIdParamSchema,
  updateFolderSchema,
} from '../validators/folder.validator.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate({ body: createFolderSchema }), asyncHandler(folderController.create));
router.get('/', asyncHandler(folderController.list));
router.get('/:id', validate({ params: folderIdParamSchema }), asyncHandler(folderController.getOne));
router.patch('/:id', validate({ params: folderIdParamSchema, body: updateFolderSchema }), asyncHandler(folderController.update));
router.delete('/:id', validate({ params: folderIdParamSchema }), asyncHandler(folderController.remove));

export default router;
