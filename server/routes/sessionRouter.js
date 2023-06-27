const Router = require("express");
const router = new Router();
const controller = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");
const iidMiddleware = require("../middleware/controls/iidMiddleware");

router.post("/create", authMiddleware, controller.createSession);
router.get("/getAll", authMiddleware, controller.getSessions);
router.get("/:id/getData", authMiddleware, iidMiddleware, controller.getSessionData);
router.post("/:id/setKey", authMiddleware, controller.setSessionKey);
router.post("/:id/invite", authMiddleware, controller.inviteUserToSession);

module.exports = router;
