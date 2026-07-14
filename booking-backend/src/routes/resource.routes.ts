import { Router } from 'express';
import { create, getOne, list, remove, update } from '../controllers/resource.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Browsing is public — no role annotation in PROJECT_GUIDE.md's route table for
// these, unlike the explicit (admin) tag on the write routes below.
router.get('/', list);
router.get('/:id', getOne);

router.post('/', requireAuth, requireRole('admin'), create);
router.patch('/:id', requireAuth, requireRole('admin'), update);
router.delete('/:id', requireAuth, requireRole('admin'), remove);

export default router;
