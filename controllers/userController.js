import { v4 as uuidv4 } from 'uuid';
import {
    ALREADYEXISTS,
    BADREQUEST,
    CREATED,
    FORBIDDEN,
    INTERNALERROR,
    NOTFOUND,
    OK,
    UNAUTHORIZED,
} from '../constants/httpStatus.js';
import nodemailer from 'nodemailer';
import { sendError, sendSuccess } from '../utils/responses.js';

import {
    responseMessages,

} from '../constants/responseMessage.js';
import Users from '../models/Users.js';
const {
    GET_SUCCESS_MESSAGES,
    INVITATION_LINK_UNSUCCESS,
    MISSING_FIELDS,
    MISSING_FIELD_EMAIL,
    NO_USER,
    NO_USER_FOUND,
    PASSWORD_AND_CONFIRM_NO_MATCH,
    PASSWORD_CHANGE,
    PASSWORD_FAILED,
    RESET_LINK_SUCCESS,
    SUCCESS_REGISTRATION,
    UN_AUTHORIZED,
    USER_EXISTS,
    USER_NAME_EXISTS
} = responseMessages;
 
import { sendEmailOTP } from '../helpers/meryFunction.js';

export const registerUser = async (req, res) => {
    console.log(req.body, "===>>> req.body")
  try {
    const { email, Cnic } = req.body;

    // Check if email and CNIC are provided
    if (!email || !Cnic) {
      return res
        .status(BADREQUEST)
        .send(sendError({ status: false, message: "Email and CNIC are required." }));
    }

    // Check if email already exists
    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
      return res
        .status(ALREADYEXISTS)
        .send(sendError({ status: false, message: "Email already exists." }));
    }

    // Check if CNIC already exists
    const existingCnic = await Users.findOne({ Cnic });
    if (existingCnic) {
      return res
        .status(ALREADYEXISTS)
        .send(sendError({ status: false, message: "CNIC already exists." }));
    }

    // Generate a password
    const generatedPassword = uuidv4().slice(0, 6);

    // Create new user
    const newUser = new Users({
      email,
      Cnic,
      password: generatedPassword, // Save plain text for demonstration (hash this in real-world apps)
    });

    const savedUser = await newUser.save();

    // Send email with generated password and login URL
     await sendEmailOTP(email, generatedPassword);

    // Respond to frontend
    return res.status(CREATED).send(
      sendSuccess({
        status: true,
        message: "User registered successfully. Login details sent via email.",
        data: savedUser,
      })
    );
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res
      .status(INTERNALERROR)
      .send(sendError({ status: false, message: "An error occurred. Please try again." }));
  }
};

export const resetPasswordEmail = async (req, res) => {
  console.log("resetPasswordEmail controller")
  try {
      const { newPassword, confirmNewPassword, token } = req.body;
      if (newPassword && confirmNewPassword && token) {
          const { result } = verify(token, process.env.JWT_SECRET_KEY);
          const userId = result._id
          const user = await Users.findById(userId);
          // return res.send(user)
          if (user) {
              const salt = genSaltSync(10);
              const hashedPassword = hashSync(newPassword, salt);
              const response =await Users.findByIdAndUpdate(userId, {
                  $set: { password: hashedPassword,isPasswordChange:true },
              });
              response.password = undefined
              return res.status(OK).send(
                  sendSuccess({
                      status: true,
                      message: 'Password Updated Successfully',
                      
                  })
              );
          } else {
              return res
                  .status(NOTFOUND)
                  .send(sendError({ status: false, message: responseMessages.NO_USER }));
          }
      } else {
          return res
              .status(BADREQUEST)
              .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
      }
  } catch (error) {
      console.log(error, "error")
      return res.status(INTERNALERROR).send(
          sendError({
              status: false,
              message: error.message,
              data: null,
          })
      );
  }
};



export const login = async (req, res) => {
try {
  const { email, password } = req.body;
  if (email && password) {
      // return res.send("login controller")

      let user = await Users.findOne({ email: email });
      console.log(user);
      if (user) {
      
          
          
          if (user.email === email ) {
          
              const token = GenerateToken({ data: user, expiresIn: '24h' });
              res.cookie('token', token, { httpOnly: true });
              res.status(OK).send(
                  sendSuccess({
                      status: true,
                      message: 'Login Successful',
                      token,
                      data: user,
                  })
              );
          } else {
              return res
                  .status(OK)
                  .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
          }
      } else {
          return res
              .status(NOTFOUND)
              .send(sendError({ status: false, message: responseMessages.NO_USER }));
      }
  } else {
      return res
          .status(500) //BADREQUEST
          // .send(sendError({ status: false, message: MISSING_FIELDS }));
          .send("Missing fields");
  }
} catch (error) {
  return res.status(500)   //INTERNALERROR
      .send(error)
  .send(
      sendError({
          status: false,
          message: error.message,
          data: null,
      })
     );
    }
};