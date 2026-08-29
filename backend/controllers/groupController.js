import Group from "../models/Group.js";
import GroupBill from "../models/GroupBill.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  try {
    const { name, type, memberEmails = [] } = req.body;

    const validTypes = ["roommates", "trip", "project", "mess", "other"];
    const groupType = validTypes.includes(type) ? type : "other";

    const members = [req.user._id];
    if (memberEmails.length) {
      const foundUsers = await User.find({ email: { $in: memberEmails } });
      for (const u of foundUsers) {
        if (!members.some((m) => m.equals(u._id))) members.push(u._id);
      }
    }

    const group = await Group.create({
      name,
      type: groupType,
      members,
      createdBy: req.user._id,
    });

    const populatedGroup = await group.populate("members", "name email photoURL upiId");
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group", error: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate(
    "members",
    "name email photoURL upiId"
  );
  res.json(groups);
};

export const getGroup = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id }).populate(
    "members",
    "name email photoURL upiId"
  );
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
};

export const addMember = async (req, res) => {
  const { email } = req.body;
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  const newMember = await User.findOne({ email });
  if (!newMember) return res.status(404).json({ message: "No user found with that email" });

  if (!group.members.some((m) => m.equals(newMember._id))) {
    group.members.push(newMember._id);
    await group.save();
  }

  res.json(await group.populate("members", "name email photoURL upiId"));
};

export const deleteGroup = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!group.createdBy.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the group creator can delete this group" });
  }

  await GroupBill.deleteMany({ group: group._id });
  await group.deleteOne();

  res.json({ message: "Group deleted" });
};
