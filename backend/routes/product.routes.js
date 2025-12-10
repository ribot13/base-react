const router = require('express').Router();
const controller = require('../controllers/product.controller');
const variationController = require('../controllers/product.variation.controller');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.findAll);
router.get('/:id', verifyToken, controller.findOne);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update); 
router.delete('/:id', verifyToken, controller.delete);
router.get('/:productId/variations', variationController.getVariations);
router.post('/:productId/variations', variationController.saveVariations);

module.exports = router;