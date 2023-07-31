//external imports
const ObjectId = require("mongodb").ObjectId;

// internal imports
const Record = require("../models/Record");
const User = require("../models/User");
// Record = require("../models/Record");

// declare module scaffolding
const recordController = {};

// create new record
recordController.createOrUpdateRecord = async (req, res, next) => {
  try {
    const { userId, websiteUrl, date, data, update } = req.body;
    console.log(userId, websiteUrl, date, data?.length);

    if (!update) {
      const parts = date.split("/");
      if (parts.length !== 3) {
        throw new Error("Invalid date format. Expected dd/mm/yyyy");
      }
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const newRecord = await Record.create({
        userId,
        websiteUrl,
        date: new Date(year, month, day),
        data,
      });
      res.status(201).send({
        isSuccess: true,
        data: newRecord,
      });
    } else {
      const updateDoc = {
        $push: {
          data: { $each: data },
        },
      };

      console.log({ updateDoc, id: req.body.id });

      const savedData = await Record.updateOne(
        { _id: new ObjectId(req.body.id) },
        updateDoc
      );

      res.status(201).send({
        isSuccess: true,
        data: savedData,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating the record", isSuccess: false });
  }
};

// get all records of any specific user
recordController.getAllRecords = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // First, check if the user with the provided userId exists
    const user = await User.findById(userId).exec();
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", isSuccess: false });
    }

    // If the user exists, fetch all records associated with this user
    const records = await Record.find({ userId: userId })
      .select("-data")
      .exec();
    // const records = await Record.find({ userId: userId })
    //   .select("-data")
    //   .exec();

    console.log({ records, userId });
    res.status(200).send({
      isSuccess: true,
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching the record", isSuccess: false });
  }
};

// gel full record (inluding records) of any specific id (_id)
recordController.getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await Record.findById(id).populate("data").exec();
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).send({
      isSuccess: true,
      data: record,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching the record", isSuccess: false });
  }
};

// delete any specific record by id (_id)
recordController.deleteRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Record.findByIdAndDelete(id).exec();
    if (!deletedRecord) {
      return res
        .status(404)
        .send({ message: "Record not found", isSuccess: false });
    }
    res.status(200).json({
      isSuccess: true,
      data: deletedRecord,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error deleting the record", isSuccess: false });
  }
};

module.exports = recordController;
