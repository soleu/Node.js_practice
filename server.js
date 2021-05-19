const express =require('express');//설치한 라이브러리 첨부
const app=express();// 라이브러리를 통한 객체 생성

const bodyParser=require('body-parser');// 요청 데이터(body) 해석을 쉽게 도와줌
app.use(bodyParser.urlencoded({extended:true}));
const MongoClient=require('mongodb').MongoClient;
const methodOverride=require('method-override');
app.use(methodOverride('_method'))
app.set('view engine','ejs');
//MongoClient.;connect('URL',function(에러,client){
var db;// 변수 하나 필요
MongoClient.connect('mongodb+srv://soleu:Zg46rapHJsxVPXaM@cluster0.aggnj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',function(에러,client){
   
   db=client.db('todoapp')//todoapp 이라는 database(폴더)에 연결 요청

   // db.collection('post').insertOne('저장할데이터',function(에러,결과){
   db.collection('post').insertOne({날짜: 'date', 제목 : 'none'},function(에러,결과){
    if(에러){return console.log(에러)}
        console.log('저장완료');
});//post라는 collection에 데이터 저장


    app.listen(8080,function(){ //DB 연결되면 출력
            console.log('listening on 8080');//콘솔창에 메세지 출력
        });
});


/* 목표 :
누군가가 /pet 으로 방문을 하면..
pet 관련된 안내문을 띄워주자*/

//app.get('경로',function(요청, 응답){응답.send('문구');});
//localhost:8080/pet으로 들어가면 페이지 생성 확인 가능
app.get('/beauty',function(req,res){
    res.send('아름다운의 공간. 어서오세요!');
});
//'/'는 메인 홈페이지를 의미
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html') //요청시, html 파일 보내는 방법
});
app.get('/write',function(req,res){ //함수안에 함수를 넣음 = 콜백함수 : 자바 스크립트에서 순차적으로 실행하고자할 때 사용
    res.sendFile(__dirname+'/write.html') //요청시, html 파일 보내는 방법
});

//어떤 사람이 /add 경로로 POST 요청을 하면 ??를 해주세요
//app.post('경로',function(){
    app.post('/add',function(req,res){
        res.send('전송완료');
        //auto increment :DB항목을 추가할때마다 1씩 증가 시켜줌(삭제되더라도 밀리지않는 고유 번호)
        db.collection('counter').findOne({name : '게시물갯수'},function(에러,결과){//counter라는 컬렉션에 있는 데이터를 찾을 것이다.
            var totNum=결과.totalPost;
            db.collection('post').insertOne({_id:totNum,날짜: req.body.date, 제목 : req.body.title},function(에러,결과){
                if(에러){return console.log(에러)}//post라는 collection에 데이터 저장
                    console.log('저장완료');
                //counter 라는 컬렉션에 있는 totalPost도 1씩 증가시켜야함.
                //db.collection('counter').updateatOne({어떤 데이터를 수정할지},{operater: 수정값},function(){});//DB 데이터 수정
                //operater :$set(변경), $inc(증가),$min(기존값보다 적을때만 변경),$rename(key값 이름변경)
                db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}},function(error,result){
                    if(error){return console.log(error)}
                    console.log('증가완료')
                })//수정. 많이하고싶다면 updateMany
          }); 
        });
    });

    // /list을 GET요청으로 접속하면
    //실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌   
    app.get('/list',function(req,res){
        //디비에 저장된 데이터 꺼내기. post 컬렉션 -> id, 제목으로 데이터 찾기
        db.collection('post').find().toArray(function(에러,결과){//결과 가져옴
            console.log(결과);//결과 출력
            res.render('list.ejs',{posts:결과});//ejs에 결과값 집어 넣기(위치 중요!)
        });// 다 찾아주세요 
        
    });

    app.delete('/delete',function(요청,응답){
        요청.body._id=parseInt(요청.body._id);//int형으로 바꿔 다시 저장함
        db.collection('post').deleteOne(요청.body,function(에러,결과){
            console.log("삭제완료");
            응답.status(200).send({message:"성공했습니다."});
            if(에러){응답.status(400).send({message:"실패했습니다."})}
        })
    })


   // /detail/1 로 접속하면 detail/1.ejs 보여줌(글번호)
    app.get('/detail/:id',function(요청,응답){ //주소 때려박아 하는 방식
        db.collection('post').findOne({_id: parseInt(요청.params.id)},function(에러,결과){
            console.log(결과);
        // 응답.render('detail.ejs',{이런 이름으로 : 이런 데이터를})
        응답.render('detail.ejs',{data : 결과});
        })
    })

    //edit/1
    app.get('/edit/:id',function(req,res){
        db.collection('post').findOne({_id:parseInt(req.params.id)},function(error,result){
            res.render('edit.ejs',{data:result});
        })
    })

    //edit put
    app.put('/edit',function(req,res){
        //db.collection('counter').updateatOne({어떤 데이터를 수정할지},{operater: 수정값},function(){});//DB 데이터 수정
        //operater :$set(변경), $inc(증가),$min(기존값보다 적을때만 변경),$rename(key값 이름변경)
        db.collection('post').updateOne({_id:parseInt(req.body.id)},{$set:{제목:req.body.title, 날짜:req.body.date}},function(error,result){
            if(error){return console.log(error)}
            console.log('수정완료')
            res.redirect('/list')//요청성공시, list로 이동. 서버의 응답이 없으면 페이지가 멈춤!
        })
  }); 

  const passport =require('passport');
  const LocalStrategy=require('passport-local').Strategy;
  const session=require('express-session');
const { render } = require('ejs');

  app.use(session({secret:'비밀코드',resave:true,saveUninitialized:false}));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/login',function(req,res){
      res.render('login.ejs')
  })

  //local의 방식으로 진행. 실패하면, /fail로 이동
  app.post('/login',passport.authenticate('local',{failureRedirect:'fail'}),function(req,res){
    res.redirect('/')
  });

  //로그인 한 사람만 보여주는 페이지
app.get('/mypage',checklogin,function(req,res){
    console.log(req.user)//deseralizeUser():세션아이디를 바탕으로 개인정보를 DB에서 찾음. user라는 이름으로 정보 불러옴
    res.render('mypage.ejs',{사용자:req.user})
});

//미들웨어 만들기
function checklogin(req,res,next){
    if(req.user){next()//다음으로 통과
    }else{
        res.send("로그인안하셨는데요?")//없으면 경고메세지 응답
    }
}


//localStrategy의 인증 방식(인증하는 방식을 Strategy라고 부름)
passport.use(new LocalStrategy({
    usernameField: 'id',//폼에 있는 name이 ''인 것이 username이다.
    passwordField: 'pw',//폼에 있는 name이 ''인 것이 password이다.
    session: true,//세션 정보를 저장할 것인지 
    passReqToCallback: false, //아이디/비번 말고도 다른 정보 검증시 true로 변경

    //사용자 아이디/비번 검증
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    //done(): 세개의 파라미터.done(서버에러,성공시사용자DB데이터,에러메세지)
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {//아이디 매칭
      if (에러) return done(에러)
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })//결과==null
      if (입력한비번 == 결과.pw) {//아이디가 있으면
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  //세션 데이터 만드는 법(로그인 성공시 발동)
  passport.serializeUser(function (user, done) {
    done(null, user.id)//user.id라는 정보로 세션을 만듬(쿠키로 보냄)
    //F11-> Application-> Cookies에 값 생성. session value가 session id와 같음(로그인 상태 확인)
  });
  
  //이 세션 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
  passport.deserializeUser(function (아이디, done) {
      //DB에서 user.id로 유저를 찾은 뒤에 유저 정보를 전달
      db.collection('login').findOne({id:아이디},function(error,result){
        done(null, result)
      })
  }); 

  let multer=require('multer');
  //디스크에 저장. memoryStorage(): RAM에 저장(휘발성)
  var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/image')//public/image 폴더안에 이미지 저장
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)//파일명 +'날짜' : +newDate()
    }
  });

  var upload=multer({storage:storage});//미들웨어처럼 실행

  app.use('/shop',require('./routes/shop.js'))
  app.use('/board/sub',require('./routes/board.js'))

  app.get('/upload', function(req,res){
      res.render('upload.ejs')
  })

  //upload.single('input의name 속성')
  app.post('/upload',upload.single('프로필'),function(req,res){
      res.send('업로드완료')
  });

  app.get('/image/이미지이름',function(req,res){//이미지 이름이 아래랑 같아야함, 파라미터형식도 가능(: 이미지 이름)
      res.sendFile(__dirname+'/public/image'+이미지이름)//파라미터 형식 :req.parms.이미지이름
  })