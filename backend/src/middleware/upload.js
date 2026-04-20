const multer = require("multer");
const path = require("path");
const fs = require("fs");

const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",

  "audio/webm": ".webm",
  "audio/wav": ".wav",
  "audio/mpeg": ".mp3",

  "video/webm": ".webm",
  "video/mp4": ".mp4",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";

    if (file.mimetype.startsWith("image/")) folder = "uploads/images";
    if (file.mimetype.startsWith("audio/")) folder = "uploads/audio";
    if (file.mimetype.startsWith("video/")) folder = "uploads/video";

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext =
      mimeToExt[file.mimetype] ||
      path.extname(file.originalname) ||
      "";

    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;
