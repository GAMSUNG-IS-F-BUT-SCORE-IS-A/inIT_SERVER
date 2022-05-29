//모듈 및 패키지 임포트
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const dotenv = require('dotenv');

//시퀄라이저
//const { sequelize, Recruit } = require('./models');
const { sequelize } = require('./models');
const { Op } = require('sequelize');
const Member = require('./models/members');
const ProjectInfo = require('./models/projectinfo');
const Recruit = require("./models/recruit");
//const { where } = require('sequelize/types');
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
app.listen(3006, '192.168.0.3', (err)=> {
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
app.post('/modifyBasicInfo', function(req, res) {
    var mNum = req.body.mNum;
    var mEmail = req.body.mEmail;
    var mDept = req.body.mDept;
    var mAcademic = req.body.mAcademic;
    var mGender = req.body.mGender;

    Member.update({
        mEmail: mEmail,
        mDept: mDept,
        mAcademic: mAcademic,
        mGender: mGender,
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
    var pRecruitStart = req.body.pRecruitStart;
    var pRecruitDue = req.body.pRecruitDue;
    var pStart = req.body.pStart;
    var pDue = req.body.pDue;
    var pPlan = req.body.pPlan;
    var pDesign = req.body.pDesign;
    var pIos = req.body.pIos;
    var pAos = req.body.pAos;
    var pGame = req.body.pGame;
    var pWeb = req.body.pWeb;
    var pServer = req.body.pServer;
    var pDescription = req.body.pDescription;
    var pOnOff = req.body.pOnOff;
    var pGender = req.body.pGender;
    var pAcademic = req.body.pAcademic;
    var pPlanf = req.body.pPlanf;
    var pDesignf = req.body.pDesignf;
    var pIosf = req.body.pIosf;
    var pAosf = req.body.pAosf;
    var pGamef = req.body.pGamef;
    var pWebf = req.body.pWebf;
    var pServerf = req.body.pServerf;
    var mNum = req.body.mNum;
    
    ProjectInfo.create({
        pTitle: pTitle,
        pType: pType,
        pRecruitStart: pRecruitStart,
        pRecruitDue: pRecruitDue,
        pStart: pStart,
        pDue: pDue,
        pPlan: pPlan,
        pDesign: pDesign,
        pAos: pAos,
        pIos: pIos,
        pGame: pGame,
        pWeb: pWeb,
        pServer: pServer,
        pDescription: pDescription,
        pOnOff: pOnOff,
        pGender: pGender,
        pAcademic: pAcademic,
        pPlanf: pPlanf,
        pDesignf: pDesignf,
        pIosf: pIosf,
        pAosf: pAosf,
        pGamef: pGamef,
        pWebf: pWebf,
        pServerf: pServerf,
        pStatus: 0,
        mNum: mNum,
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

//프로젝트 지원
app.post('/apply', function(req, res) {
    var mNum = req.body.mNum;
    var pNum = req.body.pNum;

    Recruit.create({
        mNum: mNum,
        pNum: pNum,
        rApproval: 0
    })
    .then(()=> {
        var message = "지원이 완료되었습니다";
        res.json({
            "code": 201,
            "message": message
        })
    })
    .catch((SequelizeUniqueConstraintError)=> {
        var message = "이미 지원한 프로젝트입니다"
            res.json({
                "code": 202,
                "message": message
            })
    })
    .catch((err)=>{
        console.log(err);
    })
});

//홈
app.post('/home', async function(req, res) {
    var mNum = req.body.mNum;
    var mPosition = req.body.mPosition;
    var mLevel = req.body.mLevel;
    var list_belong = [];
    //소속 플젝
    var projectInfoList1 = await ProjectInfo.findAll({
        attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
        include: [{
            where : {
                mNum: mNum,
                rApproval: 1
            },
            model: Recruit,
        }]
    });
    if(projectInfoList1.length < 3) {
        list_belong = projectInfoList1;
    }
    else {
        list_belong = projectInfoList1.slice(0, 3);
    }

    //소속 프로젝트 공고 작성자
    var writerInfo_belong = [];
    for(var i = 0; i < list_belong.length; i++) {
        
        writerInfo_belong[i] = await Member.findAll({
            attributes: ['mNum','mName'],
            where: {
                mNum: list_belong[i].mNum
            }
        });
    }
    

    //추천 플젝
    var projectInfoList2 = [];
    var list_recommend = [];
    switch(mPosition) {
        case 0:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pPlan: { [Op.gte]: 1},
                    [Op.or]: [{pPlanf: null}, {pPlanf: {[Op.gte]: mLevel}}]
                }
            });
        case 1:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pDesign: { [Op.gte]: 1},
                    [Op.or]: [{pDesignf: null}, {pDesignf: {[Op.gte]: mLevel}}]
                }
            });
        case 2:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pIos: { [Op.gte]: 1},
                    [Op.or]: [{pIosf: null}, {pIosf: {[Op.gte]: mLevel}}]
                }
            });
        case 3:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pAos: { [Op.gte]: 1},
                    [Op.or]: [{pAosf: null}, {pAosf: {[Op.gte]: mLevel}}]
                }
            });
        case 4:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pGame: { [Op.gte]: 1},
                    [Op.or]: [{pGamef: null}, {pGamef: {[Op.gte]: mLevel}}]
                }
            });
        case 5:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pWeb: { [Op.gte]: 1},
                    [Op.or]: [{pWebf: null}, {pWebf: {[Op.gte]: mLevel}}]
                }
            });
        case 6:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pServer: { [Op.gte]: 1},
                    [Op.or]: [{pServerf: null}, {pServerf: {[Op.gte]: mLevel}}]
                }
            });
    };
    if(projectInfoList2.length < 3) {
        list_recommend = projectInfoList2;
    }
    else {
        list_recommend = projectInfoList2.slice(0, 3);
    }

    //추천 플젝 공고 작성자
    var writerInfo_recommend = [];
    for(var i = 0; i < list_recommend.length; i++) {
        
        writerInfo_recommend[i] = await Member.findAll({
            attributes: ['mNum','mName'],
            where: {
                mNum: list_recommend[i].mNum
            }
        });
    }

    res.json({
        "code": 201,
        "list_belong": list_belong,
        "writerInfo_belong": writerInfo_belong,
        "list_recommend": list_recommend,
        "writerInfo_recommend": writerInfo_recommend
    });
});


//소속 프로젝트 전체 보기
app.post('/getbelongedProject', async function(req, res) {
    var mNum = req.body.mNum; //로그인 한 사용자

    //로그인한 사용자가 소속된 프로젝트 정보
    var pInfo = await ProjectInfo.findAll({
        attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
        include: [{
            model: Recruit,
            where : {
                mNum: mNum,
                rApproval: 1
            },
        }]
    });

    //프로젝트 작성자 이름
    var writerNum = [];
    var writerInfo = [];
    for(var i = 0; i < pInfo.length; i++) {
        writerNum[i] = pInfo[i].mNum;

        writerInfo[i] = await Member.findAll({
            attributes: ['mNum','mName'],
            where: {
                mNum: writerNum[i]
            }
        });
    };

    res.json({
        "pInfo": pInfo,
        "writerInfo": writerInfo
    });

    
    
    /*
    ProjectInfo.findAll({
        attributes: ['ProjectInfo.pNum', 'ProjectInfo.pTitle', 'ProjectInfo.pType', 'ProjectInfo.pOnOff', 'ProjectInfo.pStart', 
        'ProjectInfo.pDue', 'ProjectInfo.pState', ],
        include: [{
            model: Recruit,
            where : {
                mNum: mNum,
                rApproval: 1
            },
        }]
    })
    .then((projectInfoList)=>{
        console.log(projectInfoList);
        res.json({
            "projectInfoList": projectInfoList
        });
    })
    .catch((err)=>{
        console.log(err);
    });
    */
});

//추천 프로젝트 전체 보기
app.post('/getRecommenedProject', async function(req, res){
    var mPosition = req.body.mPosition;
    var mLevel = req.body.mLevel;
    var pInfo = [];
    var writerInfo = [];

    switch(mPosition) {
        case 0:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pPlan: { [Op.gte]: 1},
                    [Op.or]: [{pPlanf: null}, {pPlanf: {[Op.gte]: mLevel}}]
                }
            });
        case 1:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pDesign: { [Op.gte]: 1},
                    [Op.or]: [{pDesignf: null}, {pDesignf: {[Op.gte]: mLevel}}]
                }
            });
        case 2:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pIos: { [Op.gte]: 1},
                    [Op.or]: [{pIosf: null}, {pIosf: {[Op.gte]: mLevel}}]
                }
            });
        case 3:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pAos: { [Op.gte]: 1},
                    [Op.or]: [{pAosf: null}, {pAosf: {[Op.gte]: mLevel}}]
                }
            });
        case 4:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pGame: { [Op.gte]: 1},
                    [Op.or]: [{pGamef: null}, {pGamef: {[Op.gte]: mLevel}}]
                }
            });
        case 5:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pWeb: { [Op.gte]: 1},
                    [Op.or]: [{pWebf: null}, {pWebf: {[Op.gte]: mLevel}}]
                }
            });
        case 6:
            pInfo = await ProjectInfo.findAll({
                attributes: ['pNum', 'pTitle', 'pType', 'pOnOff', 'pStart', 'pDue', 'pState', 'mNum'],
                where: {
                    pServer: { [Op.gte]: 1},
                    [Op.or]: [{pServerf: null}, {pServerf: {[Op.gte]: mLevel}}]
                }
            });
    };
    //작성자 정보
    for(var i = 0; i < pInfo.length; i++) {
        
        writerInfo[i] = await Member.findAll({
            attributes: ['mNum','mName'],
            where: {
                mNum: pInfo[i].mNum
            }
        });
    }

    res.json({
        "pInfo": pInfo,
        "writerInfo": writerInfo
    });
});