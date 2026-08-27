const { adminAuth } = require("../middleware/adminAuth");
const express = require("express");
const path = require("path");
const multer = require("multer");
const Place = require("../models/Place");
const Review = require("../models/Review");

const router = express.Router();

const IMAGES_DIR = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "public",
  "images",
  "places"
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `review-${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files under 20MB are allowed"));
    }
  },
});

// Upload review photo (public endpoint for travelers)
router.post("/upload-review-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const publicPath = `/images/places/${req.file.filename}`;
  return res.json({ path: publicPath });
});

// Upload review video under 20MB (public endpoint for travelers)
router.post("/upload-review-video", videoUpload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video file uploaded" });
  }
  const publicPath = `/images/places/${req.file.filename}`;
  return res.json({ path: publicPath });
});

/* -------------------------------------------------------
   PLACES CRUD
------------------------------------------------------- */

// GET all places
router.get("/", async (req, res) => {
  try {
    const places = await Place.find().lean();

    // Aggregate live ratings and reviews count from Review collection
    const stats = await Review.aggregate([
      {
        $group: {
          _id: "$place",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((item) => {
      if (item._id) {
        statsMap[item._id.toString()] = {
          rating: Math.round(item.avgRating * 10) / 10,
          reviews: item.count,
        };
      }
    });

    const placesWithStats = places.map((place) => {
      const placeStats = statsMap[place._id.toString()] || { rating: 0, reviews: 0 };
      return {
        ...place,
        rating: placeStats.rating,
        reviews: placeStats.reviews,
      };
    });

    res.json(placesWithStats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch places", error: error.message });
  }
});

// GET all reviews across all places (for Admin dashboard)
router.get("/reviews/all", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("place", "name location")
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all reviews", error: error.message });
  }
});

// DELETE a review directly by reviewId (admin only)
router.delete("/reviews/:reviewId", adminAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.place) {
      await syncPlaceRating(review.place);
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
});

// GET single place by ID
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).lean();
    if (!place) return res.status(404).json({ message: "Place not found" });

    const reviews = await Review.find({ place: req.params.id }, "rating").lean();
    const count = reviews.length;
    const avg = count === 0 ? 0 : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;

    res.json({
      ...place,
      rating: count > 0 ? avg : 0,
      reviews: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch place", error: error.message });
  }
});

// POST create place
router.post("/", adminAuth, async (req, res) => {
  try {
    const newPlace = new Place(req.body);
    const savedPlace = await newPlace.save();
    res.status(201).json(savedPlace);
  } catch (error) {
    res.status(400).json({ message: "Failed to create place", error: error.message });
  }
});

// PUT update place
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlace) return res.status(404).json({ message: "Place not found" });
    res.json(updatedPlace);
  } catch (error) {
    res.status(400).json({ message: "Failed to update place", error: error.message });
  }
});

// DELETE place
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);
    if (!deletedPlace) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Place deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete place", error: error.message });
  }
});

/* -------------------------------------------------------
   REVIEWS  (public read/write, admin delete)
------------------------------------------------------- */

/**
 * Recalculates and persists the average rating + review count
 * on the parent Place document after any change to its reviews.
 */
async function syncPlaceRating(placeId) {
  const reviews = await Review.find({ place: placeId }, "rating");

  const count = reviews.length;
  const avg =
    count === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;

  await Place.findByIdAndUpdate(placeId, {
    rating: avg,
    reviews: count,
  });
}

// GET all reviews for a place (newest first)
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ place: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
});

// POST submit a new review (public — no auth required)
router.post("/:id/reviews", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    const { author, rating, text, images, videos } = req.body;

    // --- validation ---
    if (!author || typeof author !== "string" || !author.trim()) {
      return res.status(400).json({ message: "Author name is required" });
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return res.status(400).json({ message: "Review text must be at least 5 characters" });
    }

    const cleanImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim() !== "")
      : [];

    const cleanVideos = Array.isArray(videos)
      ? videos.filter((vid) => typeof vid === "string" && vid.trim() !== "")
      : [];

    const review = await Review.create({
      place: req.params.id,
      author: author.trim().slice(0, 60),
      rating,
      text: text.trim().slice(0, 1000),
      images: cleanImages,
      videos: cleanVideos,
    });

    // Keep place rating + count in sync
    await syncPlaceRating(req.params.id);

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit review", error: error.message });
  }
});

// DELETE a review (admin only)
router.delete("/:id/reviews/:reviewId", adminAuth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      place: req.params.id,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });

    await syncPlaceRating(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
});

module.exports = router;