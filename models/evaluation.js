const Sequelize = require('sequelize');

module.exports = class Evaluation extends Sequelize.Model{
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
            ePerson: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            eRecommend: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            eComment: {
                type: Sequelize.STRING(300),
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Evaluation',
            tableName: 'evaluations',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(db) {
        db.Evaluation.belongsTo(db.Member, { foreignKey: 'mNum', targetKey: 'mNum'}); //writer(평가자)
        db.Evaluation.belongsTo(db.Member, { foreignKey: 'ePerson', targetKey: 'mNum'}); //피평가자
        db.Evaluation.belongsTo(db.ProjectInfo, { foreignKey: 'pNum', targetKey: 'pNum'});
    }
}