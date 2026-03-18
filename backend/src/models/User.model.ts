import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;                                          // optional: OAuth users won't have this
  role: "food_lover" | "chef" | "admin";
  phone: string | null;
  address: string | null;
  isActive: boolean;

  authProvider: "local" | "google" | "github" | "facebook"; // match schema enum exactly
  providerId: string | null;

  // select: false — not returned by default, must be explicitly selected in queries
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["food_lover", "chef", "admin"],
      default: "food_lover",
    },

    phone: { type: String, default: null },
    address: { type: String, default: null },
    isActive: { type: Boolean, default: true },

    authProvider: {
      type: String,
      enum: ["local", "google", "github", "facebook"], // matches interface
      default: "local",
    },

    providerId: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    refreshTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

/*
  HASH PASSWORD
  - Skipped for OAuth users (no password)
  - Skipped if password field was not modified
*/
UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/*
  COMPARE PASSWORD
  - Returns false for OAuth users who have no password
*/
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/*
  CLEAN JSON RESPONSE
  - Strips sensitive fields before any response is sent
*/
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.refreshTokenExpiresAt;
  delete obj.__v;
  return obj;
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);