const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/reception.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

router.post('/checkin', authMiddleware, authorize('receptionist'), receptionController.checkin);
router.post('/walkin', authMiddleware, authorize('receptionist'), receptionController.walkin);
router.post('/reorder', authMiddleware, authorize('receptionist'), receptionController.reorder);
router.post('/announcement', authMiddleware, authorize('receptionist'), receptionController.announcement);

module.exports = router;
