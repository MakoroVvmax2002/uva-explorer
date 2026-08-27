const express = require("express");
const router = express.Router();
const Ad = require("../models/Ad");

// GET /api/ads/published - Public active published ads for homepage carousel
router.get("/published", async (req, res) => {
  try {
    const now = new Date();
    const ads = await Ad.find({
      status: "published",
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }],
    }).sort({ createdAt: -1 });

    res.json(ads);
  } catch (error) {
    console.error("Error fetching published ads:", error);
    res.status(500).json({ message: "Failed to fetch published ads" });
  }
});

// POST /api/ads/submit - Merchant submits new ad request
router.post("/submit", async (req, res) => {
  try {
    const {
      businessName,
      contactPhone,
      title,
      description,
      targetUrl,
      posterImage,
      posterType,
      posterVideo,
      receiptImage,
      durationDays,
    } = req.body;

    if (!businessName || !contactPhone || !title || (!posterImage && !posterVideo)) {
      return res.status(400).json({
        message: "Business name, contact phone, promotion title, and ad banner (image or video) are required.",
      });
    }

    const newAd = new Ad({
      businessName,
      contactPhone,
      title,
      description: description || "",
      targetUrl: targetUrl || "",
      posterImage: posterImage || "",
      posterType: posterType || (posterVideo ? "video" : "image"),
      posterVideo: posterVideo || "",
      receiptImage: receiptImage || "",
      durationDays: Number(durationDays) || 7,
      status: "pending",
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (error) {
    console.error("Error submitting ad:", error);
    res.status(500).json({ message: "Failed to submit advertisement request." });
  }
});

// GET /api/ads/admin/all - Admin fetches all ad requests
router.get("/admin/all", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    console.error("Error fetching admin ads:", error);
    res.status(500).json({ message: "Failed to fetch admin ads" });
  }
});

// PUT /api/ads/admin/:id/status - Admin updates ad status / publishing time
router.put("/admin/:id/status", async (req, res) => {
  try {
    const { status, durationDays, expiresAt } = req.body;
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Ad submission not found" });
    }

    if (status) ad.status = status;
    if (durationDays) ad.durationDays = Number(durationDays);

    if (status === "published") {
      const now = new Date();
      ad.publishedAt = now;
      if (expiresAt) {
        ad.expiresAt = new Date(expiresAt);
      } else {
        const days = ad.durationDays || 7;
        ad.expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }
    } else if (expiresAt) {
      ad.expiresAt = new Date(expiresAt);
    }

    const updatedAd = await ad.save();
    res.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad status:", error);
    res.status(500).json({ message: "Failed to update ad status" });
  }
});

// DELETE /api/ads/admin/:id - Admin deletes ad
router.delete("/admin/:id", async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ message: "Failed to delete ad" });
  }
});

module.exports = router;
