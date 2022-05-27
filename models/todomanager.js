const Sequelize = require('sequelize');

module.exports = class TodoManager extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            tNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            mNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        },{
            sequelize,
            timestamps: false,
            modelName: 'TodoManager',
            tableName: 'todomanager',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }
    static associate(db) {
        db.TodoManager.hasOne(db.Todo, {foreignKey: 'tNum', targetKey: 'tNum'});
        db.TodoManager. belongsTo(db.Member, {foreignKey: 'mNum', targetKey: 'mNum'});
    }
}