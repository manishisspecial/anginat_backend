const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const { verifyToken, hasAccess } = require('../middlewares/authMiddleware');

// Create lead - accessible to sales, admin, manager
router.post('/create', LeadController.createLead);

// Get leads - accessible to all authenticated users
router.get('/leads', [
    verifyToken,
    hasAccess(['admin', 'super-admin'])
], LeadController.getLeads);

// Update lead status - restricted to admin and manager
router.patch('/lead/status', [
    verifyToken,
    hasAccess(['admin', 'super-admin'])
], LeadController.updateLead);

// Bulk update lead status - restricted to admin only
router.patch('/leads/bulk-status', [
    verifyToken,
    hasAccess(['admin','super-admin'])
], LeadController.updateBulkStatus);

router.post('/contact-us',LeadController.createContactLead)
router.post('/institute-contact-form',LeadController.createInstituteContactUs)
router.post('/schedule-demo', LeadController.createScheduleDemoRequest);
router.post('/events-contact-us', LeadController.createEventsContactUs);

module.exports = router;