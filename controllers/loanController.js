import Loan from "../models/LoanReq.js";
import Users from "../models/Users.js";
import { sendSuccess, sendError } from "../utils/responses.js";

export const loanRequest = async (req, res) => {
  console.log(req.body, "===>>> req.body")
  try {
    const { userId, loanAmount, loanDuration, loanCategory, loanSubCategory, depositAmount, witness } = req.body;

    // Validate required fields
    if (!userId || !loanAmount || !loanDuration || !loanCategory || !loanSubCategory || !witness) {
      return res
        .status(400)
        .send(sendError({ status: false, message: "All fields are required." }));
    }

    // Create loan request
    const loan = new Loan({
      loanAmount,
      loanDuration,
      loanCategory,
      loanSubCategory,
      userId,
      depositAmount,
      witness,
    });

    // Save loan to the database
    const savedLoan = await loan.save();

    // Update user's loanRequest array in the Users collection
    await Users.findByIdAndUpdate(
      userId,
      { $push: { loanRequest: savedLoan._id } }, // Add the loan ID to the user's loanRequest array
      { new: true }
    );

    // Respond with success
    return res.status(201).send(
      sendSuccess({
        status: true,
        message: "Loan request submitted successfully.",
        data: savedLoan,
      })
    );
  } catch (error) {
    console.error("Error in loanRequest:", error);
    return res.status(500).send(
      sendError({
        status: false,
        message: "An error occurred while processing the loan request.",
      })
    );
  }
};