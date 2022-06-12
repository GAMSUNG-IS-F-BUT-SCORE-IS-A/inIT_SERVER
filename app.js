//모듈 및 패키지 임포트
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const bufferImage = require('buffer-image');
const dotenv = require('dotenv');

//시퀄라이저
//const { sequelize, Recruit } = require('./models');
const { sequelize } = require('./models');
const { Op, where } = require('sequelize');
const Member = require('./models/members');
const ProjectInfo = require('./models/projectinfo');
const Recruit = require("./models/recruit");
const Feed = require('./models/feed');
const Zzim = require('./models/zzim');
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

//이미지 저장 서버 디스크 생성
try {
    fs.readdirSync('uploads');
    console.log("이제 uploads 폴더에 이미지가 저장됩니다");
} catch(err) {
    console.log("uploads 폴더가 없어 uploads 폴더를 생성합니다");
    fs.mkdirSync('uploads');
}
//이미지 저장 형식
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            console.log("경로 설정 완");
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            console.log("파일명 설정 완");
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    })
});
//이미지 파일 비트맵으로 변환
async function readImageFile(file){
    fs.readFile(file, (err, data)=>{
        if(err){throw err;}
        const buf = new Buffer.from(data);
        return buf;
    });
}


//서버 실행
//각자 ip주소 넣기, port: 3006 변경 금지!
//학교: 172.18.9.151  집: 172.30.1.25
app.listen(3006, '172.30.1.6', (err)=> {
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
            /*
            else if(members[0].mApproval == 2) {
                members = null;
                message = "탈퇴한 계정입니다.";
                res.json({
                    'code': 204,
                    'member': members,
                    'message': message,
                })
            }*/
            else if(members[0].mApproval == 1) {
                message = members[0].mName + "님 환영합니다.";
                res.json({
                    'code': 204,
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


//프로젝트 글쓰기
app.post('/addProject', async function(req, res) {
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
    var mPosition = req.body.mPosition;
    var pStack = req.body.pStack;
    
    var create_projectInfo = await ProjectInfo.create({
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
        pStack: pStack,
    });

    var create_recruit = await Recruit.create({
        mNum: mNum,
        pNum: create_projectInfo.pNum,
        rApproval: 1,
        rPosition: mPosition
    });

    res.json({
        "code": 201,
        "message": "공고등록이 완료되었습니다."
    });

});

//프로젝트 상세보기
app.post('/detailProject', async function(req, res){
    var pNum = req.body.pNum;
    var mNum = req.body.mNum;

    //현재 보고 있는 프로젝트에 승인된 사람인가요?
    var approve = await Recruit.findOne({
        attributes : ["rApproval"],
        where: {
            mNum: mNum,
            pNum: pNum
        }
    });
    var isApproval;
    if(approve == null) {
        isApproval = false;
    }
    else {
        switch(approve.rApproval) {
            case 0:
                isApproval = false;
                break;
            case 1:
                isApproval = true;
                break;
        }
    }

    //프로젝트 정보
    var projectInfo = await ProjectInfo.findOne({
        where: {pNum: pNum}
    });
    //스택 파싱
    if(projectInfo.pStack != null) {
        var stacks = projectInfo.pStack.split(',');
        projectInfo.pStack = stacks;
    }

    //작성자 정보
    var writer = projectInfo.mNum;
    var writerInfo = await Member.findOne({
        attributes: ['mNum', 'mName', 'mPosition', 'mPhoto'],
        where : {
            mNum: writer
        }
    });

    res.json({
        "code": 201,
        "isApproval": isApproval,
        "projectInfo": projectInfo,
        "writerInfo": writerInfo
    });
});

//모집중 프로젝트 전체보기
app.get('/recrutingProject', async function(req, res){
    //프로젝트 아이템 내용
    const recruitingProject = await ProjectInfo.findAll({
        where:{
            pState: 0
        }
    });
    //작성자
    var writer = [];
    for(var i=0; i<recruitingProject.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: recruitingProject[i].mNum}
        });
    }

    res.json({
        "code": 201,
        "recruitingProject": recruitingProject,
        "writer": writer
    });

});

//모집 완료 프로젝트 전체보기
app.get('/notRecruitingProject', async function(req, res){
    //프로젝트 아이템 내용
    const notRecruitingProject = await ProjectInfo.findAll({
        where:{
            [Op.or]: [{pState: 1}, {pState: 2}]
        }
    });
    //작성자
    var writer = [];
    for(var i=0; i<notRecruitingProject.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: notRecruitingProject[i].mNum}
        });
    }

    res.json({
        "code": 201,
        "notRecruitingProject": notRecruitingProject,
        "writer": writer
    });
});

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
app.post('/apply', async function(req, res) {
    var mNum = req.body.mNum;
    var pNum = req.body.pNum;
    var rPosition = req.body.rPosition;

    var alreadyApply = await Recruit.findAll({
        where: {
            mNum: mNum,
            pNum: pNum,
            rPosition : rPosition
        }
    });
    if(alreadyApply == null) {
        Recruit.create({
            mNum: mNum,
            pNum: pNum,
            rApproval: 0,
            rPosition: rPosition
        })
        .then(()=> {
            var message = "지원이 완료되었습니다";
            res.json({
                "code": 201,
                "message": message
            })
        })
        .catch((err)=>{
            console.log(err);
        });
    }
    else{
        var message = "이미 지원한 프로젝트입니다";
        res.json({
            "code": 202,
            "message": message
        });
    }
    
});

//홈
app.post('/home', async function(req, res) {
    var mNum = req.body.mNum;
    var mPosition = req.body.mPosition;
    var mLevel = req.body.mLevel;
    var list_belong = [];
    //소속 플젝
    var projectInfoList1 = await ProjectInfo.findAll({
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
            break;
        case 1:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pDesign: { [Op.gte]: 1},
                    [Op.or]: [{pDesignf: null}, {pDesignf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 2:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pIos: { [Op.gte]: 1},
                    [Op.or]: [{pIosf: null}, {pIosf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 3:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pAos: { [Op.gte]: 1},
                    [Op.or]: [{pAosf: null}, {pAosf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 4:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pGame: { [Op.gte]: 1},
                    [Op.or]: [{pGamef: null}, {pGamef: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 5:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pWeb: { [Op.gte]: 1},
                    [Op.or]: [{pWebf: null}, {pWebf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 6:
            projectInfoList2 = await ProjectInfo.findAll({
                where: {
                    pServer: { [Op.gte]: 1},
                    [Op.or]: [{pServerf: null}, {pServerf: {[Op.gte]: mLevel}}]
                }
            });
            break;
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

    console.log(list_belong[0]);

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
                where: {
                    pPlan: { [Op.gte]: 1},
                    [Op.or]: [{pPlanf: null}, {pPlanf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 1:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pDesign: { [Op.gte]: 1},
                    [Op.or]: [{pDesignf: null}, {pDesignf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 2:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pIos: { [Op.gte]: 1},
                    [Op.or]: [{pIosf: null}, {pIosf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 3:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pAos: { [Op.gte]: 1},
                    [Op.or]: [{pAosf: null}, {pAosf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 4:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pGame: { [Op.gte]: 1},
                    [Op.or]: [{pGamef: null}, {pGamef: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 5:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pWeb: { [Op.gte]: 1},
                    [Op.or]: [{pWebf: null}, {pWebf: {[Op.gte]: mLevel}}]
                }
            });
            break;
        case 6:
            pInfo = await ProjectInfo.findAll({
                where: {
                    pServer: { [Op.gte]: 1},
                    [Op.or]: [{pServerf: null}, {pServerf: {[Op.gte]: mLevel}}]
                }
            });
            break;
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

//마이페이지 내 정보 불러오기
app.post('/myPage', async function(req, res){
    var mNum = req.body.mNum;

    var mInfo = await Member.findOne({
        where:{
            mNum: mNum
        }
    });

    //스택 파싱
    if(mInfo.mStacks != null) {
        var stacks = mInfo.mStacks.split(',');
        mInfo.mStacks = stacks;
    }

    //const stack = stacks.reverse().join();

    res.json({
        "code": 201,
        "mInfo": mInfo
    });
});

//기본정보 수정
app.post('/editBasicInfo', async function(req, res) {
    var mNum = req.body.mNum;
    var mEmail = req.body.mEmail;
    var mDept = req.body.mDept;
    var mAcademic = req.body.mAcademic;
    var mGender = req.body.mGender;

    Member.update(
        {mEmail: mEmail,
        mDept: mDept,
        mAcademic: mAcademic,
        mGender: mGender},
        {where: {
            mNum: mNum
        }})
        .then(()=>{
            var message = "회원정보가 수정되었습니다."
            var result = true;

            res.json({
                "code": 201,
                "message": message,
                "result": result
            });
        })
        .catch((err)=>{
            console.log(err);
        })
});

//링크 수정
app.post('/updateLink', async function(req, res){
    var mNum = req.body.mNum;
    var mGit = req.body.mGit;
    var mNotion = req.body.mNotion;
    var mBlog = req.body.mBlog;

    Member.update({
        mGit: mGit,
        mNotion: mNotion,
        mBlog: mBlog
    }, {
        where: {
            mNum: mNum
        }
    })
    .then(()=>{
        var message = "링크 정보가 수정되었습니다";
        var result = true;
        res.json({
            "code": 201,
            "message": message,
            "result": result
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});

//스택 수정
app.post('/updateStack', async function(req,res){
    var mNum = req.body.mNum;
    var mStacks = req.body.mStacks;
    console.log(req);
    Member.update({
        mStacks: mStacks
    }, {
        where: {mNum: mNum}
    })
    .then(()=>{
        var message = "스택 수정이 완료되었습니다";
        var result = true;
        res.json({
            "code": 201,
            "result": result,
            "message": message
        });
    })
    .catch((err)=>{
        console.log(err);
    });
});

//프로필 수정
app.post('/updateProfile', upload.single('file'), async function(req, res){
    var mNum = req.body.mNum;
    var mName = req.body.mName;
    var mPosition = req.body.mPosition;
    var mLevel = req.body.mLevel;
    var mIntroduction = req.body.mIntroduction;
    
    var imgData = readImageFile('./uploads/'+req.file.filename);

    Member.update({
        mName: mName,
        mPosition: mPosition,
        mLevel: mLevel,
        mIntroduction: mIntroduction,
        mPhoto: imgData
    }, {
        where: {mNum: mNum}
    })
    .then(()=>{
        var message = "프로필이 수정되었습니다."
        var result = true;
        res.json({
            "code": 201,
            "message": message,
            "result": result
        })
    })
    .catch((err)=>{
        console.log(err);
    });
});

//마이페이지: 프로젝트 개수
app.post('/countProject', async function(req, res) {
    var mNum = req.body.mNum;

    var joinedProject = await Recruit.findAll({
        where: {
            mNum: mNum,
            rApproval: 1
        }
    });

    var uploadProject = await ProjectInfo.findAll({
        where: {
            mNum: mNum
        }
    });

    var standBy = await Recruit.findAll({
        where: {
            mNum: mNum,
            rApproval: 0
        }
    });

    var zzimProject = await Zzim.findAll({
        where :{
            mNum: mNum
        }
    });

    res.json({
        "code": 201,
        "join": joinedProject.length,
        "upload": uploadProject.length,
        "disapproval": standBy.length,
        "zzim": zzimProject.length
    });
});

//피드 작성용 바텀시트
app.post('/finishedProject', async function(req, res) {
    var mNum = req.body.mNum;

    var project = await ProjectInfo.findAll({
        attributes: ['pNum', 'pTitle'],
        include: [{
            where: {
                mNum: mNum,
                rApproval: 1,
            },
            model: Recruit
        }],
        where: {
            pState: 2
        }
    });

    res.json({
        "code": 201,
        "project": project
    })
});

//피드 작성
app.post('/addFeed', upload.single('file'), async function(req, res){
    console.log("req.file: " + req.file);
    var fTitle = req.body.fTitle;
    var fType = req.body.fType;
    var fDescription = req.body.fDescription;
    var fLink = req.body.fLink;
    var mNum = req.body.mNum;
    var pNum = req.body.pNum;
    

    //이미지 파일 db에 넣기
    var imgData = readImageFile('./uploads/'+req.file.filename);
    var url = req.file.path

    Feed.create({
        fTitle: fTitle,
        fType: fType,
        fPhoto: imgData,
        fDescription: fDescription,
        fLink: fLink,
        mNum: mNum,
        pNum: pNum,
        fTest: url
    })
    .then(()=>{
        var message = "피드 등록이 완료되었습니다";
        res.json({
            "code": 201,
            "message": message
        })
    })
    .catch((err)=>{
        console.log(err);
    })
});

//피드 삭제
app.post('/deleteFeed', async function(req, res) {
    var fNum = req.body.fNum;

    Feed.destroy({ where: {fNum: fNum}})
    .then(()=>{
        var message = "피드가 삭제되었습니다";
        res.json({
            "code": 201,
            "message": message
        })
    })
    .catch((err)=>{
        console.log(err);
    })
});

//피드 전체 보기
app.get('/getAllFeed', async function(req, res){
    var feeds = await Feed.findAll({
        attributes: ['fNum', 'fTitle', 'fPhoto', 'fTest']
    });

    res.json({
        "code": 201,
        "feeds": feeds
    });
});

//피드 상세 보기
app.post('/detailFeed', async function(req, res){
    var fNum = req.body.fNum;

    //피드 정보
    var feedInfo = await Feed.findOne({
        include: [{
            attributes: ['mNum', 'mName', 'mPhoto'],
            model: Member
        }],
        where: {fNum: fNum}
    });

    //방법1
    /*
    const imageData = feedInfo.fPhoto;
    console.log(imageData);
    const result = bufferImage(imageData);
    */
   const imageData = feedInfo.fPhoto;
   console.log(imageData);
   
    res.json({
        "code": 201,
        "feedInfo": feedInfo,
        //"img": imageData['data']
    });
});

//승인된 팀원 정보 - 전체
app.post('/teamMember', async function(req, res){
    var pNum = req.body.pNum;

    var approvedPlan = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 0,
                rApproval: 1
            }
        }]
    });
    var approvedDesign = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 1,
                rApproval: 1
            }
        }]
    });
    var approvedIos = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 2,
                rApproval: 1
            }
        }]
    });
    var approvedAos = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 3,
                rApproval: 1
            }
        }]
    });
    var approvedWeb = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 4,
                rApproval: 1
            }
        }]
    });
      
    var approvedGame = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 5,
                rApproval: 1
            }
        }]
    });
    var approvedServer = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 6,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedPlan": approvedPlan,
        "approvedDesign": approvedDesign,
        "approvedWeb": approvedWeb,
        "approvedAos": approvedAos,
        "approvedIos": approvedIos,
        "approvedGame": approvedGame,
        "approvedServer": approvedServer
    });
});

//승인된 팀원 정보 - 기획
app.post('/memberPlanner', async function(req, res){
    var pNum = req.body.pNum;

    var approvedPlan = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 0,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedPlan": approvedPlan
    });
});

//승인된 팀원 정보 - 디자인
app.post('/memberDesigner', async function(req, res){
    var pNum = req.body.pNum;

    var approvedDesign = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 1,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedDesign": approvedDesign
    });
});

//승인된 팀원 정보 - ios
app.post('/memberIos', async function(req, res){
    var pNum = req.body.pNum;

    var approvedIos = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 2,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedIos": approvedIos
    });
});

//승인된 팀원 정보 - aos
app.post('/memberAos', async function(req, res){
    var pNum = req.body.pNum;

    var approvedAos = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 3,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedAos": approvedAos
    });
});

//승인된 팀원 정보 - 웹
app.post('/memberWeb', async function(req, res){
    var pNum = req.body.pNum;

    var approvedDesign = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 4,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedDesign": approvedDesign
    });
});
//승인된 팀원 정보 - 게임
app.post('/memberGame', async function(req, res){
    var pNum = req.body.pNum;

    var approvedGame = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 5,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedGame": approvedGame
    });
});

//승인된 팀원 정보 - 서버
app.post('/memberServer', async function(req, res){
    var pNum = req.body.pNum;

    var approvedServer = await Member.findAll({
        attributes: ['mNum', 'mName', 'mEmail', 'mPhoto'],
        include: [{
            model: Recruit,
            where: {
                pNum: pNum,
                rPosition: 6,
                rApproval: 1
            }
        }]
    });

    res.json({
        "code": 201,
        "approvedServer": approvedServer
    });
});

//마이페이지 - 찜한 프로젝트 조회
app.post('/myZzimList', async function(req, res){
    var mNum = req.body.mNum;

    var projectInfoList = await ProjectInfo.findAll({
        include: [{
            model: Zzim,
            where: {mNum: mNum}
        }]
    });
    //작성자
    var writer = [];
    for(var i=0; i<projectInfoList.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: projectInfoList[i].mNum}
        });
    }
    res.json({
        "code": 201,
        "projectInfoList": projectInfoList,
        "writer": writer
    });
});

//승인 대기중인 공고
app.post('/myWaitingApproval', async function(req, res){
    var mNum = req.body.mNum;

    var projectInfoList = await ProjectInfo.findAll({
        include: [{
            model: Recruit,
            where: {
                mNum: mNum,
                rApproval: 0
            }
        }],
        where: {
            pState: 0
        }
    });
    //작성자
    var writer = [];
    for(var i=0; i<projectInfoList.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: projectInfoList[i].mNum}
        });
    }

    res.json({
        "code": 201,
        "projectInfoList": projectInfoList,
        "writer": writer
    });
});

//참여 중인 프로젝트
app.post('/myIngProject', async function(req,res){
    var mNum = req.body.mNum;

    var projectInfoList = await ProjectInfo.findAll({
        include:[{
            model: Recruit,
            where:{
                mNum: mNum,
                rApproval: 1
            }
        }],
        where: {pState: 1}
    });

    //작성자
    var writer = [];
    for(var i=0; i<projectInfoList.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: projectInfoList[i].mNum}
        });
    }

    res.json({
        "code": 201,
        "projectInfoList": projectInfoList,
        "writer": writer
    });
});

//참여 완료 프로젝트
app.post('/myEndProject', async function(req,res){
    var mNum = req.body.mNum;
    var projectInfoList = await ProjectInfo.findAll({
        include:[{
            model: Recruit,
            where:{
                mNum: mNum,
                rApproval: 1
            }
        }],
        where: {pState:2}
    });
    //작성자
    var writer = [];
    for(var i=0; i<projectInfoList.length; i++) {
        writer[i] = await Member.findOne({
            attributes: ['mNum', 'mName'],
            where:{mNum: projectInfoList[i].mNum}
        });
    }

    res.json({
        "code": 201,
        "projectInfoList": projectInfoList,
        "writer": writer
    });
});

//업로드한 프로젝트
app.post('/myUploadProject', async function(req,res){
    var mNum = req.body.mNum;

    var projectInfoList = await ProjectInfo.findAll({
        where:{mNum: mNum}
    });

    res.json({
        "code": 201,
        "projectInfoList": projectInfoList
    });
});

//내가 속한 프로젝트의 피드
app.post('/myFeeds', async function(req,res){
    var mNum = req.body.mNum;

    var pNums = await ProjectInfo.findAll({
        attributes: ['pNum'],
        include: [{
            model: Recruit,
            where: {
                mNum: mNum,
                rApproval: 1
            }
        }],
        where: {pState: 2}
    });

    var feeds = [];
    for(var i = 0; i<pNums.length;i++){
        var feed_project = await Feed.findOne({
            attributes: ['fNum', 'fTitle', 'fTest'],
            where: {pNum: pNums[i].pNum}
        });
        feeds[i] = feed_project;
    }

    res.json({
        "code": 201,
        "Feeds": feeds
    });
});