import express from "express";
import { addUnit, deleteUnit, editUnit, getAllUnits } from "../arquitecture/Controllers/unit.controller.js";
import { requireToken } from "../helpers/middlewares/JWT.config.js";

const router = express.Router();

router.post("/add", requireToken ,addUnit);
router.delete("/delete/:id", requireToken ,deleteUnit);
router.put("/update/:id", requireToken ,editUnit);
router.get("/get", getAllUnits);

export default router;
