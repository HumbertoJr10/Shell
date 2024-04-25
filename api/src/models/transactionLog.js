const { DataTypes, NOW } = require('sequelize');

module.exports = (sequelize)=> {

    sequelize.define('log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        date: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        json: {
            type: DataTypes.JSON
        },
        endpoint: {
            type: DataTypes.JSON
        },
        code: {
            type: DataTypes.STRING
        },
        request: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false
    })
    
}