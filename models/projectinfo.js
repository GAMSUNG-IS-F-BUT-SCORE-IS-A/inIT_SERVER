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
            pRecruitStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pRecruitDue: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            pDue: {
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
            pIos: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            pAos: {
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
            pDescription: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            pOnOff: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pGender: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pAcademic: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pPlanf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pDesignf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pIosf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pAosf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pGamef: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pWebf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pServerf: {
                type: Sequelize.INTEGER,
                defaultValue: null
            },
            pState: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            mNum: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            pStack: {
                type: Sequelize.TEXT
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'ProjectInfo',
            tableName: 'projectinfos',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) { 
        db.ProjectInfo.belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
        //db.ProjectInfo.belongsToMany(db.Member, {through: 'Zzim'});
        //db.ProjectInfo.belongsToMany(db.Member, {through: 'Recruit'});
        db.ProjectInfo.hasMany(db.Zzim, {foreignKey: 'pNum', sourceKey: 'pNum'});
        db.ProjectInfo.hasMany(db.Recruit, {foreignKey: 'pNum', sourceKey: 'pNum'});
        db.ProjectInfo.hasMany(db.Feed, {foreignKey: 'pNum', sourceKey: 'pNum'});
        db.ProjectInfo.hasMany(db.Todo, {foreignKey: 'pNum', sourceKey: 'pNum'});
        db.ProjectInfo.hasMany(db.Evaluation, {foreignKey: 'pNum', sourceKey: 'pNum'});
    }
}