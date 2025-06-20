import express from "express";
import { handleSuccess, handleFail } from "../payment/sslcommerz.js";

const paymentRoute = express.Router();

paymentRoute.post("/success/:tran_id", handleSuccess);
paymentRoute.post("/fail", handleFail);

export default paymentRoute;
