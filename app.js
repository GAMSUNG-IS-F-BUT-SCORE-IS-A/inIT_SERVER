//모듈 및 패키지 임포트
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');

//시퀄라이저
const { sequelize } = require('./models');
const Member = require('./models/members');

//dotenv 패키지 사용
dotenv.config();

//express 객체 생성
const app = express();


//데이터베이스 연결
sequelize.sync({force: false})
.then(()=>{
    console.log('데이터베이스 연결');
})
.catch((err)=>{
    console.error(err);
})

//미들웨어 등록
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));


//서버 실행
//각자 ip주소 넣기, port: 3006 변경 금지!
//학교: 172.18.9.151  집: 172.30.1.25
app.listen(3006, '172.18.13.102', (err)=> {
    if(!err) {
        console.log('server start');
    }
})


//테스트 get
app.get('/test', function(req, res) {
    Member.create({
        mNum: 2,
        mType: 0,
        mID: "test1",
        mPW: "test1234",
        mName: "김더미",
        mEmail: "test@gmail.com",
        mDept: "소속1",
        mGender: 0,
        mPosition: "02",
        mLevel: 2,
        mApproval: 0,
    })
    .then((result)=>{
        console.log(result);
        res.json(result);
    })
    .catch((err)=>{
        console.log(err);
    })
})

//앱 로그인
app.post('/login', function(req, res) {
    console.log(req);
    var mID = req.body.mID;
    var mPW = req.body.mPW;
    var message = "";
    console.log(mID);
    Member.findAll({
        where: {
            mID: mID
        },
    })
    .then((members) => {
        if(members.length == 0) {
            message = "존재하지 않는 아이디입니다.";
        }
        else if(members[0].mPW == mPW) {
            message = "비밀번호가 틀렸습니다.";
        }
        else if(members[0].mApproval == 0) {
            message = "승인 대기 중입니다.";
        }
        else if(members[0].mApproval == 2) {
            message = "탈퇴한 계정입니다.";
        }
        else if(members[0].mApproval == 1) {
            message = members[0].mName + "님 환영합니다.";
        }
        res.json({
            'member': members,
            'message': message,
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});