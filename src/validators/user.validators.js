import { body } from "express-validator";

const registerValidator = () => {
  return [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

const loginValidator = () => {
  return [
    body("identifier")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ];
};

export { registerValidator, loginValidator };
