const express = require("express");
const router = express.Router();
const BusService = require("../models/BusService");

// GET /api/buses - Fetch all bus services
router.get("/", async (req, res) => {
  try {
    const buses = await BusService.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    console.error("Error fetching bus services:", error.message);
    res.status(500).json({ error: "Failed to fetch bus services" });
  }
});

// POST /api/buses - Add a new bus service (Admin route)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      routeNumber,
      origin,
      destination,
      via,
      fare,
      busType,
      phone,
      conductorPhone,
      hotline,
      description,
      image,
      position,
      routeWaypoints,
      busTimes,
      isInternal,
    } = req.body;

    if (!name || !routeNumber || !origin || !destination || !via || !fare || !busType) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newBus = new BusService({
      name,
      routeNumber,
      origin,
      destination,
      via,
      fare,
      busType,
      phone: phone || "N/A",
      conductorPhone: conductorPhone || "N/A",
      hotline: hotline || "1955 (NTC Hotline)",
      description: description || "",
      image: image || "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
      position: position && position.length === 2 ? position : [6.82977, 80.98457],
      routeWaypoints: routeWaypoints || [],
      busTimes: busTimes || [],
      isInternal: Boolean(isInternal),
    });

    const savedBus = await newBus.save();
    res.status(201).json(savedBus);
  } catch (error) {
    console.error("Error creating bus service:", error.message);
    res.status(500).json({ error: "Failed to create bus service" });
  }
});

// PUT /api/buses/:id - Update an existing bus service
router.put("/:id", async (req, res) => {
  try {
    const updatedBus = await BusService.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ error: "Bus service not found" });
    }

    res.json(updatedBus);
  } catch (error) {
    console.error("Error updating bus service:", error.message);
    res.status(500).json({ error: "Failed to update bus service" });
  }
});

// DELETE /api/buses/:id - Remove a bus service
router.delete("/:id", async (req, res) => {
  try {
    const deletedBus = await BusService.findByIdAndDelete(req.params.id);
    if (!deletedBus) {
      return res.status(404).json({ error: "Bus service not found" });
    }

    res.json({ message: "Bus service deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error deleting bus service:", error.message);
    res.status(500).json({ error: "Failed to delete bus service" });
  }
});

module.exports = router;
