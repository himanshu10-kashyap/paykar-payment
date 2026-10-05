import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required"
  );
}

export const generateAdminToken = (admin) => {

  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
    JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "1d",
    }
  );

};


export const verifyAdminToken = (token) => {

  return jwt.verify(
    token,
    JWT_SECRET
  );

};