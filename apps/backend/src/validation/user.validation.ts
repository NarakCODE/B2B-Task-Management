import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name must be at least 1 character long").optional(),
  profilePicture: z.string().url("Profile picture must be a valid URL").nullable().optional(),
});
