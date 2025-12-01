const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { verifyToken } = require("../middlewares/auth");
const {
  fetchPermissions,
  hasPermission,
} = require("../middlewares/permission.middleware");

// 1. GET - Endpoint untuk Sidebar (DIAMBIL SETELAH LOGIN)
router.get(
  "/sidebar",
  [verifyToken, fetchPermissions],
  menuController.getSidebarMenu
);

// 2. CRUD - Endpoint untuk Halaman Admin Menu
// Asumsikan rute admin memerlukan izin 'manage-menu'
// Anda bisa menambahkan middleware checkPermission di sini.
const permission = "manage-menu";

router.get(
  "/",
  verifyToken,
  fetchPermissions,
  hasPermission(permission),
  menuController.findAll
);
router.post(
  "/",
  verifyToken,
  fetchPermissions,
  hasPermission(permission),
  menuController.create
);
router.put(
  "/:id",
  verifyToken,
  fetchPermissions,
  hasPermission(permission),
  menuController.update
);
router.delete(
  "/:id",
  verifyToken,
  fetchPermissions,
  hasPermission(permission),
  menuController.delete
);

module.exports = router;
