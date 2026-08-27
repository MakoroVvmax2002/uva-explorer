const express = require("express");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const UserLog = require("../models/UserLog");

const router = express.Router();

const DATA_DIR = path.join(__dirname, "..", "data");
const EXCEL_FILE_PATH = path.join(DATA_DIR, "user_activity.xlsx");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to append a log row to Excel file
function appendLogToExcelRow(logData) {
  try {
    let workbook;
    let worksheetData = [];

    if (fs.existsSync(EXCEL_FILE_PATH)) {
      workbook = XLSX.readFile(EXCEL_FILE_PATH);
      const sheetName = workbook.SheetNames[0] || "User Activity Logs";
      const worksheet = workbook.Sheets[sheetName];
      worksheetData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Add new log entry with Google Maps URL Link
    const mapsLink =
      logData.location && (logData.location.startsWith("http://") || logData.location.startsWith("https://"))
        ? logData.location
        : `https://www.google.com/maps?q=${encodeURIComponent(logData.location || "6.8767,81.0611")}`;

    worksheetData.push({
      "User Name": logData.userName,
      "Date": logData.date,
      "Time": logData.time,
      "Google Maps Location Link": mapsLink,
      "Logged At": new Date().toLocaleString(),
    });

    const newWorksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths for readability
    newWorksheet["!cols"] = [
      { wch: 25 }, // User Name
      { wch: 15 }, // Date
      { wch: 15 }, // Time
      { wch: 50 }, // Google Maps Location Link
      { wch: 25 }, // Logged At
    ];

    XLSX.utils.book_append_sheet(workbook, newWorksheet, "User Activity Logs", true);
    XLSX.writeFile(workbook, EXCEL_FILE_PATH);
  } catch (err) {
    console.error("Error writing to Excel file:", err);
  }
}

// POST /api/user-logs/log - Log new user activity
router.post("/log", async (req, res) => {
  try {
    const { userName, location } = req.body;

    if (!userName || typeof userName !== "string" || !userName.trim()) {
      return res.status(400).json({ message: "User name is required" });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString("en-US", { hour12: true }); // hh:mm:ss AM/PM
    const userLocation = location || "Uva Province, Sri Lanka";

    const logEntry = {
      userName: userName.trim(),
      date: dateStr,
      time: timeStr,
      location: userLocation,
    };

    // 1. Save to Excel Sheet
    appendLogToExcelRow(logEntry);

    // 2. Save to MongoDB
    let savedMongo = null;
    try {
      savedMongo = await UserLog.create(logEntry);
    } catch (dbErr) {
      console.warn("MongoDB UserLog save warning:", dbErr.message);
    }

    res.status(201).json({
      message: "User activity logged successfully to Excel sheet",
      data: savedMongo || logEntry,
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
    res.status(500).json({ message: "Failed to log user activity" });
  }
});

// GET /api/user-logs/all - Fetch all user activity logs for Admin
router.get("/all", async (req, res) => {
  try {
    let logs = [];

    // First try reading from Excel file
    if (fs.existsSync(EXCEL_FILE_PATH)) {
      try {
        const workbook = XLSX.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        logs = rawData.map((row, idx) => ({
          _id: `excel_${idx}_${Date.now()}`,
          userName: row["User Name"] || "Visitor",
          date: row["Date"] || "",
          time: row["Time"] || "",
          location: row["Google Maps Location Link"] || row["Location"] || "https://www.google.com/maps?q=6.8767,81.0611",
          createdAt: row["Logged At"] || new Date().toISOString(),
        }));
      } catch (excelErr) {
        console.warn("Reading Excel file error:", excelErr);
      }
    }

    // Fallback/Merge with MongoDB
    if (logs.length === 0) {
      logs = await UserLog.find().sort({ createdAt: -1 }).lean();
    }

    res.json(logs);
  } catch (error) {
    console.error("Error fetching user logs:", error);
    res.status(500).json({ message: "Failed to fetch user logs" });
  }
});

// GET /api/user-logs/download-excel - Download Excel file (.xlsx) directly
router.get("/download-excel", (req, res) => {
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      // Create empty Excel file if not exists yet
      appendLogToExcelRow({
        userName: "System Initializer",
        date: new Date().toLocaleDateString("en-GB"),
        time: new Date().toLocaleTimeString("en-US"),
        location: "Badulla, Uva Province",
      });
    }

    res.download(EXCEL_FILE_PATH, "Uva_Explorer_User_Activity_Logs.xlsx");
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    res.status(500).send("Unable to download Excel file");
  }
});

module.exports = router;
