const Message = require("../model/MessageModel");

exports.createMessage = async (req, res) => {
  try {
    const {
      senderId,
      senderName,
      senderDepartment,
      recipientDepartment,
      content,
    } = req.body;
    const newMessage = new Message({
      senderId,
      senderName,
      senderDepartment,
      recipientDepartment,
      content,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating message", error: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

exports.getRecentMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(5);
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({
      message: "Error fetching recent messages",
      error: error.message,
    });
  }
};
