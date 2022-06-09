const Sequelize = require('sequelize');

module.exports = class Todo extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            tNum: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tPart: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            tTodo: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            tWritedate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            tDday: {
                type: Sequelize.DATE,
                allowNull: false
            },
            pNum: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            mNums: {
                type: Sequelize.STRING(50),
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