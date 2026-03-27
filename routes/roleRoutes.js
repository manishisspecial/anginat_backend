const express = require('express');
const RoleController = require('../controllers/RoleController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, RoleController.getAll);
router.get('/:id', verifyToken, RoleController.getById);
router.post('/', verifyToken, RoleController.create);
router.put('/:id', verifyToken, RoleController.update);
router.delete('/:id', verifyToken, RoleController.delete);

module.exports = router;
