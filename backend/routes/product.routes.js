const router = require('express').Router();
const controller = require('../controllers/product.controller');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.findAll);
router.get('/:id', verifyToken, controller.findOne);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update); 
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;