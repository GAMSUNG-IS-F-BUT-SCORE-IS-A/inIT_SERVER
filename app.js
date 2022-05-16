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
const ProjectInfo = require('./models/projectinfo');
//const { Model } = require('sequelize/types');

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
app.listen(3006, '172.18.9.110', (err)=> {
    if(!err) {
        console.log('server start');
    }
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
            members = null;
            message = "존재하지 않는 아이디입니다.";
        }
        else if(members[0].mPW != mPW) {
            members = null;
            message = "비밀번호가 틀렸습니다.";
        }
        else if(members[0].mPW == mPW) {
            if(members[0].mApproval == 0) {
                members = null;
                message = "승인 대기 중입니다.";
            }
            else if(members[0].mApproval == 2) {
                members = null;
                message = "탈퇴한 계정입니다.";
            }
            else if(members[0].mApproval == 1) {
                message = members[0].mName + "님 환영합니다.";
            }
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

//회원가입
app.post('/signUp', function(req, res) {
    console.log(res);
    var mID = req.body.mID;
    var mPW = req.body.mPW;
    var mName = req.body.mName;
    var mEmail = req.body.mEmail;
    var mDept = req.body.mDept;
    var mAcademic = req.body.mAcademic;
    var mGender = req.body.mGender;
    var mPosition = req.body.mPosition;
    var mLevel = req.body.mLevel;

    Member.create({
        mType: 0,//회원유형 일단 0(일반회원) -> 회원유형 나눠지면 수정 필요!
        mID: mID,
        mPW: mPW,
        mName: mName,
        mEmail: mEmail,
        mDept: mDept,
        mAcademic: mAcademic,
        mGender: mGender,
        mPosition: mPosition,
        mLevel: mLevel,
        mApproval: 0,
    })
    .then(() => {
        message = "회원가입이 완료되었습니다.";
        res.json({
            message: message,
        })
    })
    .catch((err)=>{
        console.log(err);
    });
})

//테스트
app.post('/test', function(req, res) {
    ProjectInfo.create({
        pTitle: "test",
        pType: 0,
        pRdateStart: "2022-05-20",
        pRdateDue: "2022-05-26",
        pPdateStart: "2022-06-01",
        pPdateDue: "2022-06-25",
        pServer: 3,
        mNum: 4,
        pStatus: 1,
    })
    .then(()=> {
        console.log("완료");
    })
    .catch((err)=>{
        console.log(err);
    });
})