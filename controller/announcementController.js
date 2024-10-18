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
