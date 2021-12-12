const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('player', {
        playerID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        levelCap: {
            type: DataTypes.INTEGER,
            defaultValue: 20,
            allowNull: false,
        },
        characterCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }
    }, {
        //prevents sequelize from storing created at and updated at values.
        timestamps: false,
    });
};