import mongoose, { mongo } from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";

const option = {
  httpOnly: true,
  secure: false, 
  sameSite: "Lax",
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens ");
  }
};

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res
      .status(200)
      .json(new ApiResponse(200, userExist, "user do exist"));
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "unable to create user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created"));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(404, "all fields are required");
  }

  const existUser = await User.findOne({ email });

  if (!existUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isCorrect = await existUser.isPasswordCorrect(password);

  if (!isCorrect) {
    throw new ApiError(404, "incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existUser._id
  );

  const loggedInUser = await User.findById(existUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
};

const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out"));
};

export { registerUser, loginUser, logoutUser };
