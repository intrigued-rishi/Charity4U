import {body, query} from 'express-validator';
import User from '../models/User';
import Org from '../models/Orginization'
const fs = require('fs');
const path = require('path');

export class UserValidators {
  //.............................validation for donor signup....................................................
  static signUp() {
    return [ body('email', 'Email is Required').isEmail().custom((email, {req}) => {
      return User.findOne({email: email, verified: true}).then(user => {
        if (user) {
          throw new Error('User Already Exist');
        } else {
          return true;
        }
      })
    }),
      body('password', 'Password is Required').isAlphanumeric()
          .isLength({min: 8, max: 20}).withMessage('Password can be from 8-20 Characters only'),
      body('username', 'Username is Required').isString(),body('address','Address is required').isString(),
      body('phone','Phone no. is required').isNumeric()]
  }
//..................................................................................................................

//.............................validation for org signup same as above....................................................
  static signUpOrg() {
    return [ body('email', 'Email is Required').isEmail().custom((email, {req}) => {
      return Org.findOne({email: email, verified: true}).then(user => {
        if (user) {
          fs.unlinkSync(path.join(__dirname,'..','..','static','avatars',req.files[0].filename));
          fs.unlinkSync(path.join(__dirname,'..','..','static','avatars',req.files[1].filename));
          throw new Error('User Already Exist');
        } else {
          return true;
        }
      })
    }),
      body('password', 'Password is Required').isAlphanumeric()
          .isLength({min: 8, max: 20}).withMessage('Password can be from 8-20 Characters only'),
      body('username', 'Username is Required').isString(),body('address','Address is required').isString(),
      body('phone','Phone no. is required').isNumeric()]
  }


  //....................Validating a donor during email verification..........................................
  static verifyUser() {
    return [body('verification_token', 'Verification Token is Required').isNumeric()]
  }
//.........................................................................................................

  //....................Validating an organization during email verification..........................................
  static verifyUserOrg() {
    return [body('verification_token', 'Verification Token is Required').isNumeric()]
  }
//...................................................................................................................

//........................Login validation of donor.................................................................
  static login() {
    return [query('email', 'Email is Required').isEmail()
        .custom((email, {req}) => {
          return User.findOne({email: email}).then(user => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw  new Error('User Does Not Exist');
            }
          });
        }), query('password', 'Password is Required').isAlphanumeric()]
  }
//...................................................................................................................

//........................Login validation of donor.................................................................
  static loginOrg() {
    return [query('email', 'Email is Required').isEmail()
        .custom((email, {req}) => {
          return Org.findOne({email: email}).then(user => {
            if (user) {
              req.user = user;
              return true;
            } else {
              throw  new Error('User Does Not Exist');
            }
          });
        }), query('password', 'Password is Required').isAlphanumeric()]
  }
//.............................................................................................................

//........................Login validation of organization.....................................................
  static updateProfilePic() {
    return [body('profile_pic').custom((profilePic, {req}) => {
      if (req.file) {
        return true;
      } else {
        throw new Error('File not Uploaded');
      }
    })]
  }
  //............................................................................................................
}


