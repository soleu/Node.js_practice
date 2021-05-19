var router=require('express').Router(); //라우터 파일 필수

router.get('/shirts',function(req,res){ //중복된 경로도 app.use로 묶을 수 있음
res.send("셔츠를 파는 페이지입니다.");
});

router.get('/shirts',function(req,res){
res.send("셔츠를 파는 페이지입니다.");
});


module.exports=router;