const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

router.get('/departments', patientController.getDepartments);
router.get('/doctors', patientController.getDoctors);
router.post('/appointments', authMiddleware, authorize('patient'), patientController.bookAppointment);
router.get('/queue-status', authMiddleware, authorize('patient'), patientController.getQueueStatus);

module.exports = router;
