const { DataTypes, NOW } = require('sequelize');

module.exports = (sequelize)=> {

    sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,            
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,               
        },
        docID: {
            type: DataTypes.STRING,            
        },
        IDType: {
            type: DataTypes.STRING,            
        },
        expirationID: {
            type: DataTypes.STRING, 
            allowNull: true,
            defaultValue: null              
        },
        expirationPP: {
            type: DataTypes.STRING, 
            allowNull: true,
            defaultValue: null    
        },
        picture: {
            type: DataTypes.STRING,
        },
        passaportID: {
            type: DataTypes.STRING,            
        },
        gender: {
            type: DataTypes.STRING,            
        },
        birthDate: {
            type: DataTypes.STRING,
            defaultValue: "1990-01-01"      
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null        
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "Usuario Básico"
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        request_email: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        pre_email: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false
      })
}
