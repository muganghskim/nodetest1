const express = require("express");
const MongoClient = require("mongodb").MongoClient;
//데이터 베이스의 데이터 입력 출력을 위한 함수 명령어 불러드림
const moment = require("moment");
const app = express();
const port = 8080;

//정적연결
app.use(express.static('public'));
//ejs 태그를 사용하기 위한 세팅
app.set("view engine","ejs");
//사용자가 입력한 데이터값을 주소를 통해서 전달 (파싱) 
app.use(express.urlencoded({extended: true}));
//데이터 베이스 연결작업
let db;  //데이터 베이스 연결을 위한 변수 세팅
MongoClient.connect("mongodb+srv://admin:qwer1234@testdb.ssk6ku3.mongodb.net/?retryWrites=true&w=majority",function(err,result){
    //에러가 발생했을 경우 메세지 출력(선택사항)
    if(err){ return console.log(err);}
    //위에서 만든 db변수에 최종 연결 ()안에는 mongodb 사이트에서 생성한 데이터베이스 이름
    db = result.db("testdb");
    //db 연결이 제대로 됬다면 서버실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });
});

app.get("/",function(req,res){
    res.send("메인페이지 접속완료");
});

//게시글 작성 페이지 경로 요청
app.get("/insert",function(req,res){
    res.render("brd_insert");
});
//게시글 폼태그 응답
app.post("/add",function(req,res){
    let time = moment().format("YY년MM월DD일 HH시mm분ss초");
    db.collection("ex6_count").findOne({name:"문의게시판"},function(err,result){
        db.collection("ex6_board").insertOne({
            brdid:result.totalCount+1,
            brdtitle:req.body.title,
            brdcontext:req.body.context,
            brdauther:req.body.auther,
            brdtime:time,
            brdcount:0
        },function(err,result){
            db.collection("ex6_count").updateOne({name:"문의게시판"},{$inc:{totalCount:1}},function(err,result){
                res.redirect("/list");
            });
        });
    });
});

app.get("/list",function(req,res){
    //데이터 베이스에서 게시글 관련 데이터들 꺼내서 갖고온 후 brf_list 전달
    db.collection("ex6_board").find().toArray(function(err,result){
        res.render("brd_list",{data:result});
    });
});

//url parameter 주소에 데이터값을 실어서 보내는 요청방법
app.get("/detail/:no",function(req,res){
    //주소창을 통해서 보내는 데이터는 전부 스트링
    db.collection("ex6_board").updateOne({brdid:Number(req.params.no)},{$inc:{brdcount:1}},function(err,result){
        db.collection("ex6_board").findOne({brdid:Number(req.params.no)},function(err,result){
            res.render("brd_detail",{data:result});
        });
    });
    
});

//수정 경로로 요청
app.get("/uptview/:no",function(req,res){
    db.collection("ex6_board").findOne({brdid:Number(req.params.no)},function(err,result){
        res.render("brd_uptview",{data:result});
    });
});

//수정 시 데이터 업데이트
app.post("/update",function(req,res){
    db.collection("ex6_board").updateOne({brdid:Number(req.body.id)},{
        $set:{
            brdtitle:req.body.title,
            brdcontext:req.body.context,
            brdauther:req.body.auther     
        }
    },function(err,result){
        res.redirect("/detail/" + req.body.id);
    });
});

app.get("/delete/:no",function(req,res){
    db.collection("ex6_board").deleteOne({brdid:Number(req.params.no)},function(err,result){
        res.redirect("/list");
    });
});