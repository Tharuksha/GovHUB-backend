const Announcement = require("../model/Announcement");

exports.getAnnouncementsByDepartment = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      departmentID: req.params.departmentID,
    })
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  const announcement = new Announcement({
    departmentID: req.body.departmentID,
    content: req.body.content,
    postedBy: req.body.postedBy,
  });

  try {
    const newAnnouncement = await announcement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if the user is authorized to delete the announcement
    if (
      announcement.departmentID.toString() !== req.user.departmentID.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this announcement" });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
