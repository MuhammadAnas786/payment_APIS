import bcrypt from 'bcrypt';
import { UserModel } from '../Data/users';
import { resmessage } from '../Helpers/constants';
import { GenToken } from '../util';
import { emitter } from '../Helpers/events';

export const user = {
  create: async (req) => {
    let data = req.body;

    try {
      const check = await UserModel.findOne({ email: data.email });

      if (check) {
        // console.log(check)
        return {
          status: 400,
          body: {
            message: resmessage.username_email_exists
          }
        };
      }
      const hashPassword = await bcrypt.hash(data.password, 12);

      data = {
        ...data,

        password: hashPassword,
        profile: null
      };

      const ref = new UserModel({ ...data });

      await ref.save();
      emitter.emit('setUserProfile', { user: ref });
      return {
        status: 200,
        body: { message: resmessage.record_added, id: ref._id }
      };
    } catch (err) {
      if (err.name === 'ValidationError') {
        return {
          status: 400,
          body: {
            message: resmessage.mongodb_validation_err,
            error: err
          }
        };
      }
      return {
        status: 400,
        body: { message: resmessage.something_wrong, err }
      };
    }
  },
  login: async (req) => {
    try {
      const { email, password } = req;
      const validate_user = await UserModel.findOne({ email });
      // console.log(validate_user)
      if (validate_user) {
        const compare = await bcrypt.compare(password, validate_user.password);
        // console.log(compare);
        if (compare) {
          emitter.emit('UpdateLoginStatus', validate_user);
          return {
            status: 200,
            body: {
              Bearer_token: GenToken(
                validate_user._id,
                validate_user.role,
                validate_user.email
              ),
              message: 'User authorized!'
            }
          };
        }
        return {
          status: 400,
          body: {
            message: resmessage.incorrect_password
          }
        };
      }
      return {
        status: 400,
        body: {
          message: resmessage.user_not_found
        }
      };
    } catch (err) {
      // console.log(err)
      return {
        status: 400,
        body: {
          message: resmessage.something_wrong,
          error: err.message
        }
      };
    }
  }
};
