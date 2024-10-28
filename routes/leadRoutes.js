// routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/create', LeadController.createLead);
router.get('/leads', authMiddleware, LeadController.getLeads);
router.patch('/lead/status', authMiddleware, LeadController.updateLeadStatus);
router.patch('/leads/bulk-status', authMiddleware, LeadController.updateBulkStatus);
module.exports = router;
