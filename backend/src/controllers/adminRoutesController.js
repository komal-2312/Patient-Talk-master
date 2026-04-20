const express = require("express");
const mongoose = require("mongoose");
const FEEDBACK = require("../models/feedback");
const { get } = require("mongoose");
const HOSPITAL_DETAILS = require("../models/HOSPITAL_DETAILS");
const { generateFeedbackQR } = require("../helpers/QRgenerator");
const FEEDBACK_RESPONSE = require("../models/FeedbackResponses");
const FEEDBACK_PERSON = require("../models/ContactPerson");
const authMiddleware = require("../middleware/auth");
const { logFormCreated, logFormEdited, logFeedbackDeleted, logError } = require("../helpers/logger");



async function getFeedbacksByHospital(req, res) {
  try {
    const feedbacks = await FEEDBACK.find({
      hospitalId: req.hospitalId,
      isDeleted: false,
    });

    return res.json({
      success: true,
      data: feedbacks,
    });
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    logError({ message: err.message, stack: err.stack, context: "getFeedbacksByHospital" });
    return res.status(500).json({ message: "Server error" });
  }
};

async function getHospitalProfile(req, res) {
  try {
    const hospitalProfile = await HOSPITAL_DETAILS.findById(req.hospitalId).select("+hospital_logo +hospital_name +adminColor +userColor +location");
    if (!hospitalProfile) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }
    if (!hospitalProfile.hospital_name) {
      hospitalProfile.hospital_name = "Your Hospital Name";
    }
    if (!hospitalProfile.hospital_logo) {
      hospitalProfile.hospital_logo = "https://via.placeholder.com/150?text=Hospital+Logo";
    }
    let logoBase64 = null;

    if (hospitalProfile.hospital_logo?.data) {
      const buffer = hospitalProfile.hospital_logo.data;
      const mime = hospitalProfile.hospital_logo.contentType || "image/png";

      logoBase64 = `data:${mime};base64,${buffer.toString("base64")}`;
    }
    return res.json({
      success: true,
      data: { hospital_name: hospitalProfile.hospital_name, hospital_logo: logoBase64, adminColor: hospitalProfile.adminColor, userColor: hospitalProfile.userColor },
    });
  } catch (err) {
    console.error("Error fetching hospital profile:", err);
    logError({ message: err.message, stack: err.stack, context: "getHospitalProfile" });
    return res.status(500).json({ message: "Server error" });

  }

}

async function changeHospitalName(req, res) {
  try {
    const hospitalId = req.hospitalId;
    const { newHospital_name } = req.body;

    const updatedHospital = await HOSPITAL_DETAILS.findByIdAndUpdate(
      hospitalId,
      { hospital_name: newHospital_name },
      { new: true }
    );

    if (!updatedHospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedHospital,
    });
  } catch (err) {
    console.error("Error updating hospital name:", err);
    logError({ message: err.message, stack: err.stack, context: "changeHospitalName" });
    return res.status(500).json({ message: "Server error" });
  }
}




async function createFeedback(req, res) {
  try {
    const { department_name, questions, logo_png } = req.body;

    if (!department_name) {
      return res.status(400).json({ message: "Department name required" });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(401).json({ message: "At least one question required" });
    }
    if (!logo_png) {
      return res.status(401).json({ message: "Department logo required" });
    }


    const feedback = await FEEDBACK.create({
      hospitalId: new mongoose.Types.ObjectId(req.hospitalId),
      feedback_name: `${department_name}`,
      questions: questions || [],
      logo_png, // base64 image
      isActive: true,
    });

    logFormCreated({ feedbackId: feedback._id, hospitalId: req.hospitalId, department_name });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (err) {
    console.error(err);
    logError({ message: err.message, stack: err.stack, context: "createFeedback" });
    return res.status(500).json({ message: "Server error" });
  }
}

async function getFeedbackById(req, res) {    // GET /admin/getfeedbackform/:id
  //get feedback by Feedback ID and hospital ID, return 404 if not found
  const feedback = await FEEDBACK.findOne({
    _id: req.params.id,
    hospitalId: req.hospitalId,
    isDeleted: false,
  });

  if (!feedback) {
    return res.status(404).json({ success: false });
  }

  res.status(200).json({ success: true, data: feedback });
}



async function updateFeedbackById(req, res) {  // PUT /admin/feedback/:id
  //update feedback by Feedback ID and hospital ID, return 404 if not found
  try {
    const { questions, isActive } = req.body;

    await FEEDBACK.updateOne(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { $set: { questions, isActive } }
    );

    logFormEdited({ feedbackId: req.params.id, hospitalId: req.hospitalId });

    res.status(200).json({ success: true });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "updateFeedbackById" });
    res.status(500).json({ success: false, message: "Error updating feedback" });
  }
}
async function deleteFeedbackById(req, res) {
  try {
    const result = await FEEDBACK.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { $set: { isDeleted: true } },
      { new: true } // returns updated document
    );

    // If not found
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    logFeedbackDeleted({
      feedbackId: req.params.id,
      hospitalId: req.hospitalId,
    });

    res.status(200).json({
      success: true,
      message: "Feedback marked as deleted",
      data: result,
    });

  } catch (err) {
    logError({
      message: err.message,
      stack: err.stack,
      context: "deleteFeedbackById",
    });

    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
    });
  }
}


async function getFeedbackQR(req, res) {
  const feedback = await FEEDBACK.findOne({
    _id: req.params.id,
    hospitalId: req.hospitalId,
    isDeleted: false,
  });

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  const { qrBase64 } = await generateFeedbackQR(feedback._id);

  res.status(200).json({
    success: true,
    qr: qrBase64,
  });
}






async function getFeedbackResponses(req, res, next) {
  try {
    const feedbackId = req.params.id;
    const hospitalId = req.hospitalId;

    const responses = await FEEDBACK_RESPONSE.find({
      feedbackId,
      hospitalId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (!responses || responses.length === 0) {
      return res.status(415).json({
        success: false,
        message: `No responses found for this feedback form. `,
      });
    }

    return res.status(200).json({
      success: true,
      data: responses,
    });
  } catch (err) {
    console.log(err);
    logError({ message: err.message, stack: err.stack, context: "getFeedbackResponses" });
    // 👈 IMPORTANT
  }
}

async function DeleteResponseById(req, res) {
  try {
    const responseId = req.params.id;
    const hospitalId = req.hospitalId;

    const result = await FEEDBACK_RESPONSE.findOneAndUpdate(
      { _id: responseId, hospitalId, isDeleted: false }, // prevent double delete
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true }
    );

    // If not found
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Response not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Response marked as deleted",
      data: result,
    });

  } catch (err) {
    console.log(err);
    logError({
      message: err.message,
      stack: err.stack,
      context: "DeleteResponseById",
    });

    return res.status(500).json({
      success: false,
      message: "Error deleting response",
    });
  }
}
async function addFeedbackPerson(req, res) {
  try {
    const { name, mobile, email } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name required" });
    }
    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number required" });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number format" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }


    const person = await FEEDBACK_PERSON.create({
      hospitalId: req.hospitalId,
      name,
      mobile,
      email,
    });

    res.status(201).json({
      success: true,
      data: person,
    });
  } catch (err) {
    logError({ message: err.message, stack: err.stack, context: "addFeedbackPerson" });
    res.status(500).json({ success: false });
  }
}




async function getFeedbackPersons(req, res) {
  const persons = await FEEDBACK_PERSON.find({
    hospitalId: req.hospitalId,
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: persons });
}





async function assignFeedbackPerson(req, res) {
  try {
    const { feedbackId, personId, assign } = req.body;
    const hospitalId = req.hospitalId;

    const feedback = await FEEDBACK.findOne({ _id: feedbackId, hospitalId, isDeleted: false });
    const person = await FEEDBACK_PERSON.findOne({ _id: personId, hospitalId });

    if (!feedback || !person) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (assign) {
      // add person to feedback
      await FEEDBACK.updateOne(
        { _id: feedbackId },
        { $addToSet: { assignedTo: personId } }
      );

      // add feedback to person
      await FEEDBACK_PERSON.updateOne(
        { _id: personId },
        {
          $addToSet: {
            assignedFeedbacks: {
              feedbackId,
              departmentName: feedback.feedback_name,
            },
          },
        }
      );
    } else {
      // remove person from feedback
      await FEEDBACK.updateOne(
        { _id: feedbackId },
        { $pull: { assignedTo: personId } }
      );

      // remove feedback from person
      await FEEDBACK_PERSON.updateOne(
        { _id: personId },
        { $pull: { assignedFeedbacks: { feedbackId } } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    logError({ message: err.message, stack: err.stack, context: "assignFeedbackPerson" });
    res.status(500).json({ success: false });
  }
}


async function changeTheme(req, res) {
  try {
    const { primaryColor, secondaryColor } = req.body;

    if (!primaryColor || !secondaryColor) {
      return res.status(400).json({
        success: false,
        message: "Primary and Secondary colors are required",
      });
    }

    const updated = await HOSPITAL_DETAILS.findByIdAndUpdate(
      req.hospitalId,
      {
        adminColor: primaryColor,
        userColor: secondaryColor,
      },
      { new: true }
    );
    console.log("UPDATED DOC:", updated);
    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
    });
  } catch (err) {
    console.error("Error updating theme:", err);
    logError({ message: err.message, stack: err.stack, context: "changeTheme" });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


module.exports = { getFeedbacksByHospital, getHospitalProfile, changeHospitalName, createFeedback, getFeedbackById, updateFeedbackById, deleteFeedbackById, getFeedbackQR, getFeedbackResponses, DeleteResponseById, addFeedbackPerson, getFeedbackPersons, assignFeedbackPerson, changeTheme };