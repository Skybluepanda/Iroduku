const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('character', {
        FK_playerID: DataTypes.STRING,
        characterID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,        
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        health: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            allowNull: false,
        },
        stamina: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            allowNull: false,
        },
        //temporary fish inventory.
        fish: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
    }, {
        //prevents sequelize from storing created at and updated at values.
        timestamps: false,
    });
};