//모듈 및 패키지 임포트
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');

//dotenv 패키지 사용
dotenv.config();

//express 객체 생성
const app = express();


//미들웨어 등록
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    //secret: precess.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

//데이터베이스 연결
sequelize.sync({force: false})
.then(()=>{
    console.log('데이터베이스 연결');
})
.catch((err)=>{
    console.error(err);
})


//서버 실행
//각자 ip주소 넣기, port: 3006 변경 금지!
//학교: 172.18.9.164
app.listen(3006, '192.168.0.12', (err)=> {
    if(!err) {
        console.log('server start');
    }
})


//앱 로그인
app.post('/login', function(req, res) {
    console.log(req);
    var wID = req.wID;
    var wPW = req.wPW;

    let sql = 'select * from init.member where wID = ?';
});