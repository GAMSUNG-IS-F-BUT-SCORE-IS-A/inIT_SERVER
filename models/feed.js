const Sequelize = require('sequelize');

module.exports = class Feed extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            fNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            fTitle: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            fType: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            fPhoto: {
                type: Sequelize.BLOB
            },
            fDescription: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            fLink: {
                type: Sequelize.STRING(200)
            },
            mNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            pNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            fTest: {
                type: Sequelize.STRING(200)
            },
            fTimeStamp: {
                type: Sequelize.DATE
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Feed',
            tableName: 'feeds',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Feed.belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
        db.Feed.belongsTo(db.ProjectInfo, {foreignKey: 'pNum', targetKey: 'pNum'});
    }
}