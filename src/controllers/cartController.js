import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// Add or Update Cart Item
export async function addToCart(req, res) {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const price = product.price;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, price }],
        totalPrice: price * quantity,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price });
      }

      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );

      await cart.save();
    }

    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
}

// Get Cart by User
export async function getCart(req, res) {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price image"
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
}

// Update Cart Item Quantity
export async function updateCartItem(req, res) {
  const { userId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Product not in cart" });

    cart.items[itemIndex].quantity = quantity;
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
}

// Remove an Item from Cart
export async function removeCartItem(req, res) {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
}

// Clear Cart
export async function clearCart(req, res) {
  const { userId } = req.body;

  try {
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
}
