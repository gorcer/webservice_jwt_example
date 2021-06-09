'use strict';
const {
  Model
} = require('sequelize');

var jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    userName: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
  });

    User.checkToken = function(token, secret) {
        // Првоеряем токен
        try {
            var decoded = jwt.verify(token, secret);
        } catch(err) {
            console.log(err);
            return false;
        }

        // Ставим признак что можно доверять
        return User.findOne({
            where: {
                token: token
            }
        }).then(function(user) {

            if (user) {
                return user;
            } else {
                return false;
            }
        });
    }

  return User;
};