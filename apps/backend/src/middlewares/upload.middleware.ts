import multer from "multer"

// Use memory storage – we'll stream the buffer directly to Cloudinary
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB per file
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    // Allow common document, image, and archive types
    const allowed = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
      "application/vnd.ms-excel",
      "application/vnd.ms-powerpoint",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
    ]

    const isAllowed = allowed.some((type) => file.mimetype.startsWith(type))
    if (isAllowed) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`))
    }
  },
})
