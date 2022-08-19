//branch for aws

'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const Member = require('./members');
const ProjectInfo = require('./projectinfo');
const Zzim = require('./zzim');
const Feed = require('./feed');
const Recruit = require('./recruit');
const Todo = require('./todo');
const Evaluation = require('./evaluation');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);


db.sequelize = sequelize;

db.Member = Member;
db.ProjectInfo = ProjectInfo;
db.Zzim = Zzim;
db.Feed = Feed;
db.Recruit = Recruit;
db.Todo = Todo;
db.Evaluation = Evaluation;

Member.init(sequelize);
ProjectInfo.init(sequelize);
Zzim.init(sequelize);
Feed.init(sequelize);
Recruit.init(sequelize);
Todo.init(sequelize);
Evaluation.init(sequelize);

Member.associate(db);
ProjectInfo.associate(db);
Zzim.associate(db);
Feed.associate(db);
Recruit.associate(db);
Todo.associate(db);
Evaluation.associate(db);

module.exports = db;
