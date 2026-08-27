const express = require("express");
const path = require("path");
const multer = require("multer");
const { createToken, adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

/* -------------------------------------------------------
   IMAGE UPLOAD
   Images are saved to client/public/images/places/
   so Vite can serve them at /images/places/<filename>
------------------------------------------------------- */

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
    // Sanitize and make filename unique
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}-${safe}`;
    cb(null, unique);
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

router.post(
  "/upload",
  adminAuth,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const publicPath = `/images/places/${req.file.filename}`;
    return res.json({ path: publicPath });
  }
);

/* -------------------------------------------------------
   LOGIN
------------------------------------------------------- */

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      message: "Incorrect admin password",
    });
  }

  const token = createToken();

  return res.json({
    message: "Admin login successful",
    token,
  });
});

module.exports = router;