'use strict';
module.exports = (sequelize, DataTypes) => {
  var Books = sequelize.define('Books', 
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    genre: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    first_published: DataTypes.INTEGER 
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  
  });
  return Books;
};


//NOTES:

//There are objects of each argument. 'classMethods' is its own object argument,
//and so are the columns. 