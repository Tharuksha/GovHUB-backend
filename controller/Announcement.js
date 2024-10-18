const { Announcement } = require("../model/Announcement");

class AnnouncementController {
  /**
   * @swagger
   * /api/announcements:
   *   post:
   *     summary: Create a new announcement
   *     tags: [Announcements]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - departmentID
   *               - content
   *               - createdBy
   *             properties:
   *               departmentID:
   *                 type: string
   *               content:
   *                 type: string
   *               createdBy:
   *                 type: string
   *     responses:
   *       201:
   *         description: Announcement created successfully
   *       400:
   *         description: Error creating announcement
   */
  async createAnnouncement(req, res) {
    try {
      const announcement = new Announcement(req.body);
      await announcement.save();
      res
        .status(201)
        .json({ message: "Announcement created successfully", announcement });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/announcements/{departmentID}:
   *   get:
   *     summary: Get announcements for a specific department
   *     tags: [Announcements]
   *     parameters:
   *       - in: path
   *         name: departmentID
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of announcements
   *       500:
   *         description: Server error
   */
  async getAnnouncementsByDepartment(req, res) {
    try {
      const { departmentID } = req.params;
      const announcements = await Announcement.find({ departmentID })
        .sort({ createdAt: -1 })
        .limit(5);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add more methods as needed (e.g., updateAnnouncement, deleteAnnouncement)
}

module.exports = new AnnouncementController();
