'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: true
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: true
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: true
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Loans;
};