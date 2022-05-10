'use strict';

const Sequelize = require('sequelize');
const Member = require('./members');
const member = require('./members');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);


db.sequelize = sequelize;

db.Member = Member;

Member.init(sequelize);
Member.associate(db);

module.exports = db;
