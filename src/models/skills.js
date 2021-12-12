const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('skills', {
        FK_characterID: DataTypes.STRING,
        s0id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s0xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s0lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s1id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s1xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s1lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s2id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s2xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s2lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s3id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s3xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s3lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s4id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s4xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s4lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s5id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s5xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s5lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s6id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s6xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s6lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s7id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s7xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s7lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s8id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s8xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s8lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s9id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s9xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },
        s9lvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            unique: false,
        },

    }, {
        //prevents sequelize from storing created at and updated at values.
        timestamps: false,
    });
};