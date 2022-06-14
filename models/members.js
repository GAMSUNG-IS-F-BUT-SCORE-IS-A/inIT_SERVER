const Sequelize = require('sequelize');
const { Recruit } = require('.');

module.exports = class Member extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            mNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                //allowNull: false,
                unique: true,
                autoIncrement: true,
            },
            mID: {
                type: Sequelize.STRING(16),
                allowNull: false,
                unique: true,
            },
            mPW: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            mName: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            mEmail: {
                type: Sequelize.STRING(100),
            },
            mDept: {
                type: Sequelize.STRING(100),
            },
            mAcademic: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mGender: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mPosition: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mLevel: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mIntroduction: {
                type: Sequelize.TEXT
            },
            mGit: {
                type: Sequelize.STRING(200)
            },
            mNotion: {
                type: Sequelize.STRING(200)
            },
            mBlog: {
                type: Sequelize.STRING(200)
            },
            mPhoto: {
                type: Sequelize.TEXT
            },
            mApproval: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            mStacks: {
                type: Sequelize.TEXT
            }
        },
        {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Member',
            tableName: 'members',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Member.hasMany(db.ProjectInfo, {foreignKey: 'mNum', sourceKey: 'mNum'});
        //db.Member.belongsToMany(db.ProjectInfo, {through: 'Zzim'});
        //db.Member.belongsToMany(db.ProjectInfo, {through: 'Recruit'});
        db.Member.hasMany(db.Zzim, {foreignKey: 'mNum', sourceKey: 'mNum'});
        db.Member.hasMany(db.Recruit, {foreignKey: 'mNum', sourceKey: 'mNum'});
        db.Member.hasMany(db.Feed, {foreignKey: 'mNum', sourceKey: 'mNum'});
        //db.Member.belongsToMany(db.Todo, {through: 'TodoManager'})
        db.Member.hasMany(db.Evaluation, {foreignKey: 'mNum', sourceKey: 'mNum'});
        db.Member.hasMany(db.Evaluation, {foreignKey: 'ePerson', sourceKey: 'mNum'});
    }
};