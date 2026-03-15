import { Router, type IRouter } from "express";
import healthRouter from "./health";
import walletRouter from "./wallet";
import tokensRouter from "./tokens";
import marketRouter from "./market";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/wallet", walletRouter);
router.use("/tokens", tokensRouter);
router.use("/market", marketRouter);

export default router;
