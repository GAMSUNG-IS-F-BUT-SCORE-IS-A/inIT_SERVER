const Sequelize = require('sequelize');

module.exports = class Stack extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            mNum: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            sStack: {
                type: Sequelize.STRING(50)
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Stack',
            tableName: 'stacks',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }
    static associate(db) {
        db.Stack.belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
    }
}