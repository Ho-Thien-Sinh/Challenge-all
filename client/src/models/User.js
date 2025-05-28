const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *           readOnly: true
 *         name:
 *           type: string
 *           description: The name of the user
 *           minLength: 1
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         password:
 *           type: string
 *           format: password
 *           description: The password of the user
 *           minLength: 6
 *           writeOnly: true
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The role of the user
 *           default: user
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email has been verified
 *           default: false
 *         emailVerificationToken:
 *           type: string
 *           description: Token for email verification (hashed)
 *           writeOnly: true
 *         emailVerificationExpire:
 *           type: string
 *           format: date-time
 *           description: Expiration date for email verification token
 *           writeOnly: true
 *         resetPasswordToken:
 *           type: string
 *           description: Token for password reset (hashed)
 *           writeOnly: true
 *         resetPasswordExpire:
 *           type: string
 *           format: date-time
 *           description: Expiration date for password reset token
 *           writeOnly: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was last updated
 *           readOnly: true
 */
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING
  },
  emailVerificationExpire: {
    type: DataTypes.DATE
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// Encrypt password using bcrypt
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Sign JWT and return
User.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Match user entered password to hashed password in database
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User; 