const router = require('express').Router();
const MongoClient = require('mongodb').MongoClient;

let db;

function 로그인확인(요청, 응답, next) {
    if (요청.user) {
        next();
    } else {
        console.log('로그인이 필요합니다.'); // 콘솔에 출력
        응답.redirect('/login'); // 클라이언트를 로그인 페이지로 리다이렉트
    }
}




// MongoDB 연결
MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
    if (error) return console.log(error);
    db = client.db('virus_scan');
});

// 게시판 메인 페이지
router.get('/', function (요청, 응답) {
    db.collection('board.post')
        .find()
        .toArray(function (에러, 결과) {
            console.log(결과);
            응답.render('board.ejs', { posts: 결과 });
        });
});

// 글 작성 페이지
router.get('/write', 로그인확인, function (req, res) {
    res.render('write.ejs', { 사용자: req.user });
});

// 글 추가 (POST 요청)
router.post('/new', 로그인확인, function (요청, 응답) {
    const newPost = {
        제목: 요청.body.title,
        내용: 요청.body.content,
        날짜: new Date(),
        작성자: 요청.user.아이디,
    };

    // 게시물 갯수 업데이트
    db.collection('board.counter').findOne(
        { name: '게시물갯수' },
        function (에러, 결과) {
            if (에러) return console.log(에러);
            var 총게시물갯수 = 결과.totalPost;

            // 새 게시물 추가
            db.collection('board.post').insertOne(
                {
                    _id: 총게시물갯수 + 1,
                    ...newPost,
                },
                function (에러, 결과) {
                    if (에러) {
                        console.log('게시물 추가 실패:', 에러);
                    } else {
                        console.log('게시물 추가 성공:', newPost);

                        // 게시물 갯수 업데이트
                        db.collection('board.counter').updateOne(
                            { name: '게시물갯수' },
                            { $inc: { totalPost: 1 } },
                            function (에러, 결과) {
                                if (에러) {
                                    console.log('게시물 갯수 업데이트 실패:', 에러);
                                }
                            }
                        );

                        응답.redirect('/board'); // 게시물 추가 후 게시판으로 리다이렉트
                    }
                }
            );
        }
    );
});

// 게시물 상세 보기
router.get('/detail/:id', function (요청, 응답) {
    db.collection('board.post').findOne(
        { _id: parseInt(요청.params.id) },
        function (에러, 결과) {
            응답.render('detail.ejs', { data: 결과 });
        }
    );
});

// 게시물 수정 페이지
router.get('/detail/:id/edit', function (요청, 응답) {
    db.collection('board.post').findOne(
        { _id: parseInt(요청.params.id) },
        function (에러, 결과) {
            응답.render('edit.ejs', { post: 결과 });
        }
    );
});

// 게시물 수정 (PUT 요청)
router.put('/edit', function (요청, 응답) {
    db.collection('board.post').updateOne(
        { _id: parseInt(요청.body.id) },
        {
            $set: {
                제목: 요청.body.title,
                내용: 요청.body.content,
                날짜: new Date(),
            },
        },
        function () {
            console.log('수정완료');
            응답.redirect('/board');
        }
    );
});

// 게시물 삭제 (DELETE 요청)
router.delete('/delete', function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id);
    db.collection('board.post').deleteOne(
        { _id: 요청.body._id, 작성자: 요청.user.아이디 },
        function (에러, 결과) {
            if (에러) {
                console.log('삭제 실패:', 에러);
            } else {
                console.log('삭제완료');
            }
            응답.status(200).send({ message: '삭제 요청이 처리되었습니다.' }); // 클라이언트에 성공 메시지 전송
        }
    );
});

module.exports = router;
