import Address from "../models/addressModel.js";

// Add a new address
export async function addAddress(req, res) {
  const {
    user,
    fullName,
    phone,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  if (
    !user ||
    !fullName ||
    !phone ||
    !street ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    if (isDefault) {
      await Address.updateMany({ user }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    res
      .status(201)
      .json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding address", error: error.message });
  }
}

// Get all addresses for a user
export async function getUserAddresses(req, res) {
  const { userId } = req.params;

  try {
    const addresses = await Address.find({ user: userId });
    res.status(200).json(addresses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
}

// Get single address by address ID
export async function getSingleUserAddress(req, res) {
  const { addressId } = req.params;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json(address);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching address", error: error.message });
  }
}

// Update address
export async function updateAddress(req, res) {
  const { id } = req.params;
  const { isDefault, ...updateData } = req.body;

  try {
    if (isDefault) {
      const address = await Address.findById(id);
      if (address) {
        await Address.updateMany({ user: address.user }, { isDefault: false });
      }
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      { ...updateData, isDefault },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) return res.status(404).json({ message: "Address not found" });

    res.status(200).json({ message: "Address updated", address: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating address", error: error.message });
  }
}

// Delete address
export async function deleteAddress(req, res) {
  const { id } = req.params;

  try {
    const deleted = await Address.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Address not found" });

    res.status(200).json({ message: "Address deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting address", error: error.message });
  }
}
