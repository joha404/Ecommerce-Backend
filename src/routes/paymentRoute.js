// routes/payment.js
import express from "express";
import { initiatePayment } from "../payment/initiatePayment.js";
import { handleSuccess, handleFail } from "../payment/paymentResponse.js";

const paymentRouter = express.Router();

paymentRouter.post("/initiate", initiatePayment);
paymentRouter.get("/success/:tran_id", handleSuccess);
paymentRouter.get("/fail", handleFail);
paymentRouter.get("/cancel", handleFail);
paymentRouter.post("/ipn", (req, res) => {
  console.log("IPN received:", req.body);
  res.status(200).send("IPN acknowledged");
});

export default paymentRouter;
