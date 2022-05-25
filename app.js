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
app.listen(3006, '172.30.1.25', (err)=> {
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
            res.json({
                'code': 201,
                'member': members,
                'message': message,
            })
        }
        else if(members[0].mPW != mPW) {
            members = null;
            message = "비밀번호가 틀렸습니다.";
            res.json({
                'code': 202,
                'member': members,
                'message': message,
            })
        }
        else if(members[0].mPW == mPW) {
            if(members[0].mApproval == 0) {
                members = null;
                message = "승인 대기 중입니다.";
                res.json({
                    'code': 203,
                    'member': members,
                    'message': message,
                })
            }
            else if(members[0].mApproval == 2) {
                members = null;
                message = "탈퇴한 계정입니다.";
                res.json({
                    'code': 204,
                    'member': members,
                    'message': message,
                })
            }
            else if(members[0].mApproval == 1) {
                message = members[0].mName + "님 환영합니다.";
                res.json({
                    'code': 205,
                    'member': members,
                    'message': message,
                })
            }
        }
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
        var code = 201;
        message = "회원가입이 완료되었습니다.";
        res.json({
            "code": code,
            "message": message,
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});

//아이디 중복 확인
app.post('/idCheck', function(req, res) {
    var id = req.body.mID;
    var is_check = false;
    var message = "";

    Member.findAll({
        where: {
            mID: id,
        },
    })
    .then((result)=>{
        if(result.length == 0) {//결과 없음
            message = "사용 가능한 아이디입니다.";
            is_check = true;
            res.json({
                "code": 201,
                "is_check": is_check,
                "message": message
            })
        }
        else {
            message = "이미 사용 중인 아이디입니다."
            res.json({
                "code": 202,
                "is_check": is_check,
                "message": message,
            })
        }
    })
    .catch((err)=> {
        console.log(err);
    });
});

//회원 정보 수정
app.post('/modifyMember', function(req, res) {
    var mNum = req.body.mNum;
    var mName = req.body.mName;
    var mEmail = req.body.mEmail;
    var mGender = req.body.mGender;
    var mIntroduction = req.body.mIntroduction;

    Member.update({
        mName: mName,
        mEmail: mEmail,
        mGender: mGender,
        mIntroduction: mIntroduction,
        mApproval: 0,
    }, {
        where: {mNum: mNum}
    })
    .then(()=>{
        var message = "회원 정보 수정이 완료되었습니다.";
        res.json({
            "code": 201,
            "message": message,
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});

//회원 탈퇴
app.post('/withdraw', function(req, res) {
    var mNum = req.body.mNum;
    var is_checked = req.body.is_checked;
    var message = "";

    if(is_checked == false) {
        message = "탈퇴 확인을 완료해주세요";
        res.json({
            "code": 201,
            "message": message
        });
    }
    else {
        Member.destroy({
            where: {
                mNum: mNum
            }
        })
        .then((result)=>{
            message = "탈퇴가 완료되었습니다.";
            res.json({
                "code": 202,
                "message": message
            })
        })
        .catch((err)=>{
            console.log(err);
        })
    }
})


//프로젝트 정보 업로드
app.post('/addProject', function(req, res) {
    console.log(req);
    var pTitle = req.body.pTitle;
    var pType = req.body.pType;
    var pRdateStart = req.body.pRdateStart;
    var pRdateDue = req.body.pRdateDue;
    var pPdateStart = req.body.pPdateStart;
    var pPdateDue = req.body.pPdateDue;
    var pPlan = req.body.pPlan;
    var pDesign = req.body.pDesign;
    var pAndroid = req.body.pAndroid;
    var pIos = req.body.pIos;
    var pGame = req.body.pGame;
    var pWeb = req.body.pWeb;
    var pServer = req.body.pServer;
    var mNum = req.body.mNum;
    
    ProjectInfo.create({
        pTitle: pTitle,
        pType: pType,
        pRdateStart: pRdateStart,
        pRdateDue: pRdateDue,
        pPdateStart: pPdateStart,
        pPdateDue: pPdateDue,
        pPlan: pPlan,
        pDesign: pDesign,
        pAndroid: pAndroid,
        pIos: pIos,
        pGame: pGame,
        pWeb: pWeb,
        pServer: pServer,
        mNum: mNum,
        pStatus: 0
    })
    .then(()=>{
        var message = "프로젝트 모집 공고가 등록되었습니다."
        res.json({
            "code": 201,
            "message": message,
        })
    })
    .catch((err)=>{
        console.log(err);
    })
})

//프로젝트 공고 삭제
app.post('/delProject', function(req, res) {
    var pNum = req.body.pNum;

    ProjectInfo.destroy({where: {pNum: pNum}})
    .then(()=>{
        var message = "프로젝트 모집 공고가 삭제되었습니다.";
        res.json({
            "code": 201,
            "message": message
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});