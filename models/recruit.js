const Sequelize = require('sequelize');

module.exports = class Recruit extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            mNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            pNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            rApproval: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Recruit',
            tableName: 'recruit',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Recruit.belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
        db.Recruit.belongsTo(db.ProjectInfo, {foreignKey: 'pNum', targetkey: 'pNum'});
     }
}