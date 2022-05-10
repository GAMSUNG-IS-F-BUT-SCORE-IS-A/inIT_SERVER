const Sequelize = require('sequelize');

module.exports = class Member extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            mNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                unique: true,
                autoIncrement: true,
            },
            mType: {
                type: Sequelize.INTEGER,
                allowNull: false,
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
            mGender: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mPosition: {
                type: Sequelize.CHAR,
                allowNull: false,
            },
            mLevel: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            mApproval: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            mIntroduction: {
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
    static associate(db) {}
};