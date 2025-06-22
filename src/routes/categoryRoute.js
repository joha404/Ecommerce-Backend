// routes/categoryRoutes.js
import express from "express";
import categoryController from "../controllers/categoryController.js";
import upload from "../middleware/multer.js";

const categoryRouter = express.Router();

// categoryRouter.post(
//   "/create",
//   upload.single("image"),
//   categoryController.createCategory
// );
categoryRouter.post(
  "/create",
  upload.single("image"),
  categoryController.createCategory
);

categoryRouter.get("/all", categoryController.allCategory);
categoryRouter.get("/:id", categoryController.allCategory);
categoryRouter.put(
  "/update/:id",
  upload.single("image"),
  categoryController.updateCategory
);
categoryRouter.delete("/delete", categoryController.deleteCategory);

export default categoryRouter;
