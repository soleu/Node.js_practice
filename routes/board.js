var router=require('express').Router();

//해당 라우터에 있는 모든 URL에 미들웨어 적용
router.use(checklogin);

//미들웨어 만들기
function checklogin(req,res,next){
    if(req.user){next()//다음으로 통과
    }else{
        res.send("로그인안하셨는데요?")//없으면 경고메세지 응답
    }
}

router.get('/game',function(req,res){
res.send("게임 페이지 입니다.");
});

router.get('/sports',function(req,res){
    res.send("스포츠 페이지 입니다.");
    });

    module.exports=router;