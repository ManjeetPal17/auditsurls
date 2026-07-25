import { Router } from 'express';
import { runAudit } from '../controllers/auditController';
import { validateAuditRequest } from '../validators/auditValidator';

const router = Router();

router.post('/audit', validateAuditRequest, runAudit);

export default router;
