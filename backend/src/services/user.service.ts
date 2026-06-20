import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};

export const updateUserService = async (
  userId: string,
  body: { name?: string; profilePicture?: string | null }
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (body.name !== undefined) user.name = body.name;
  if (body.profilePicture !== undefined) user.profilePicture = body.profilePicture;

  await user.save();

  return {
    user: user.omitPassword(),
  };
};
