const Sequelize = require('sequelize');

module.exports = class Todo extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            tNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tTodo: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            tWritedate: {
                type: Sequelize.DATE
            },
            tDday: {
                type: Sequelize.DATE,
                allowNull: false
            },
            mNums: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            tState: {
                type: Sequelize.TINYINT,
                allowNull: false,
                defaultValue: 0
            },
            pNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Todo',
            tableName: 'todos',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    
    static associate(db) {
        db.Todo.belongsTo(db.ProjectInfo, {foreignKey: 'pNum', targetKey: 'pNum'});
    }
}