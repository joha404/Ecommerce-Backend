import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Order from "../models/orderModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleSuccess(req, res) {
  const { tran_id } = req.params;

  try {
    const order = await Order.findOne({ tranjectionId: tran_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paidStatus) {
      return res.send("Payment already completed.");
    }

    order.paidStatus = true;
    order.status = "Approved";
    await order.save();

    const successPagePath = path.join(
      __dirname,
      "../public/payment-success.html"
    );

    if (!fs.existsSync(successPagePath)) {
      return res
        .status(200)
        .send("Payment successful, but no success page found.");
    }

    fs.readFile(successPagePath, "utf-8", (err, data) => {
      if (err) return res.status(500).send("Error reading success page");
      res.send(data);
    });
  } catch (error) {
    console.error("Error in payment success:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function handleFail(req, res) {
  console.log("Payment failed.");
  res.status(400).send("Payment failed. Please try again.");
}
