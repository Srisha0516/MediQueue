const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

router.get('/queue', authMiddleware, authorize('doctor'), doctorController.getQueue);
router.post('/start', authMiddleware, authorize('doctor'), doctorController.startConsultation);
router.post('/complete', authMiddleware, authorize('doctor'), doctorController.completeConsultation);
router.get('/summary', authMiddleware, authorize('doctor'), doctorController.getSummary);

module.exports = router;
