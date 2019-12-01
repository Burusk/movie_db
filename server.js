const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();
const server = express();
const qs = require('querystring')
const mysql = require('mysql')

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '11111111',
    database : 'movie'
})

db.connect(function(err) {
    if(err) {
        console.error('ERR : ' + err.stack)
        return;
    }
    console.log('Success DB connection')
})

app.prepare()
.then(()=>{

    //커스텀 라우터 전후 비교 시 아래 부분을 주석 처리 후 확인해 보세요
    server.get('/board/:title', (req, res) => {
        const page = '/boardView';
        const params = {title: req.params.title}
        app.render(req, res, page, params)
    });
    
    server.post('/login_process', (req, res) => {
        var body ='';
        req.on('data', function(data) {
            body = body + data;
        })
        req.on('end', function(end){
            var contents = qs.parse(body)
            var id = contents.user_id
            var pwd = contents.user_pwd
            
            db.query('select user_pwd from customer where user_id = ?', id, function (error, results, fields) {
                if (error) throw error
                if (pwd != results[0].user_pwd) {
                    res.json({success: false, msg: '아이디나 비밀번호를 확인해주세요.'})
                } else {
                    res.writeHead(302, {Location: `/`})
                    res.end()
                }
            })
        })
    })

    server.post('/join_process', (req, res) => {
        var body = '';
        req.on('data', function(data){
            body = body + data;
        })
        req.on('end', function(end){
            var contents = qs.parse(body)
            var name = contents.user_name
            var id = contents.user_id
            var pwd = contents.user_pwd
            var phn = contents.user_ph
            var bd = contents.user_birth
            db.query(`
            INSERT INTO customer (username, user_id, user_pwd, user_ph, user_birth, vip) 
              VALUES(?, ?, ?, ?, ?, 'Bronze')`,
              [name, id, pwd, phn, bd],
              function (error, results, fields) {
                if (error) {
                  throw error;
                }
              });
            res.writeHead(302, {Location: `/`})
            res.end()
        })
    })

    server.get('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(9090, (err) => {
        if(err) throw err;
        console.log("> Ready on Server Port: 9090")
    })
})
.catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
})

