const express = require("express");
const Facility = require("../models/Facility");
const { adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// GET all facilities
router.get("/", async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch facilities", error: err.message });
  }
});

// POST add facility (Admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, type, location, description, phone, rating, reviews, image, lat, lng, openingDays, openingHours, googleMapsUrl, googlePlaceId } = req.body;
    if (!name || !type || !location || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Name, type, location, latitude, and longitude are required." });
    }

    const facility = new Facility({
      name,
      type,
      location,
      description: description || "",
      phone: phone || "N/A",
      rating: Number(rating) || 4.5,
      reviews: Number(reviews) || 10,
      image: image || "",
      lat: Number(lat),
      lng: Number(lng),
      openingDays: openingDays || "Monday - Sunday",
      openingHours: openingHours || "08:00 AM - 08:00 PM",
      googleMapsUrl: googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + location)}`,
      googlePlaceId: googlePlaceId || "",
    });

    await facility.save();
    res.status(201).json(facility);
  } catch (err) {
    res.status(500).json({ message: "Failed to create facility", error: err.message });
  }
});

// PUT update facility (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Facility.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Facility not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update facility", error: err.message });
  }
});

// DELETE facility (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Facility.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Facility not found" });
    }
    res.json({ message: "Facility deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete facility", error: err.message });
  }
});

module.exports = router;
