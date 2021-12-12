const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('skilldesc', {
        skillID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        maxLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        //prevents sequelize from storing created at and updated at values.
        timestamps: false,
    });
};