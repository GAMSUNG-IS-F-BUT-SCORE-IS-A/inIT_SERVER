const Sequelize = require('sequelize');

module.exports = class ProjectInfo extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            pNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pTitle: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            pType: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            pRdateStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pRdateDue: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pPdateStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pPdateDue: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pPlan: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pDesign: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pAndroid: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pIos: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pGame: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pWeb: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pServer: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            mNum: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            pStatus: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'ProjectInfo',
            tableName: 'projectinfo',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) { 
        db.ProjectInfo.belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
    }
}