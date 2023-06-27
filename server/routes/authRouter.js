const Router = require("express");
const router = new Router();
const controller = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const usernameMiddleware = require("../middleware/controls/usernameMiddleware");
const passwordMiddleware = require("../middleware/controls/passwordMiddleware");

router.post("/registration", usernameMiddleware, passwordMiddleware, controller.registration);
router.post("/login", controller.login);

module.exports = router;
