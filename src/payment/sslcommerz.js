import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Order from "../models/orderSchema.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleSuccess(req, res) {
  const { tran_id } = req.params;

  try {
    const order = await Order.findOne({ tranjectionId: tran_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updateResult = await Order.updateOne(
      { tranjectionId: tran_id },
      { $set: { paidStatus: true } }
    );

    if (updateResult.modifiedCount > 0) {
      const successPagePath = path.join(
        __dirname,
        "../public/payment-success.html"
      );

      if (!fs.existsSync(successPagePath)) {
        return res.status(500).json({ message: "Success page missing" });
      }

      fs.readFile(successPagePath, "utf-8", (err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error reading success page" });
        }
        res.send(data);
      });
    } else {
      return res.status(400).json({ message: "Failed to update order status" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export function handleFail(req, res) {
  console.log("Payment failed.");
  res.status(400).json({ message: "Payment failed" });
}
