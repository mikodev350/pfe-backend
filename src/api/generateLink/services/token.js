const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key"; // Replace with your actual secret key

module.exports = {
  generateTemporaryToken: (resourceId) => {
    return jwt.sign({ resourceId }, secretKey, { expiresIn: "2h" });
  },

  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded;
    } catch (error) {
      return null; // Invalid or expired token
    }
  },
};
