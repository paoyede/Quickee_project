import { alterTable, createDB, createTable } from "../Controller/DbController";
import { Router } from "express";

const router: Router = Router();

router.get("/createdb", createDB);
router.get("/createtable", createTable);
router.get("/altertable", alterTable);

export default router;
