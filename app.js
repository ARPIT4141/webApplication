const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();

var session = require('express-session');

var flash = require('connect-flash');
app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret:'some secret here',
      cookie: { maxAge: 14400000 },
    })
);
app.use(flash());

const mysql = require('mysql2');
const encoder = express.urlencoded({

    extended: false

});

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'student'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
});


//set views file
app.set('views',path.join(__dirname,'views'));
			
//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//--------------------------home page----------------
app.get('/',(req, res) =>{

    res.render('user_home', {
        title : 'Result Management System'
        
    });

});


app.get('/teacher',(req, res) => {
 
    let sql = "SELECT * FROM student";
    let query = connection.query(sql, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
          }
        res.render('user_index', {
            title : 'Result Management System',
            student : rows
        });
    });
});

app.get('/student',(req, res) =>{

    res.render('model/Student', {
        title : 'Result Management System'
        
    });

});

app.post("/find",encoder,function(req,res){

    var Rollno = req.body.Rollno;

    var date=req.body.date;


    connection.query("select * from student where  Rollno = ? and date = ?",[Rollno,date] , function(error,rows){

        if(rows.length > 0)

        res.render("target/final",{

            title: 'Result Management System',

            // users : results[0]
            student: rows

        });

        else{

             //console.log('Incorrect Roll number or Date of Birth!');
            res.render('errorHandler/error', {
                title : 'Result Management System'
                
            });

         }

    });

});
//----------------add user---------------------
app.get('/add',(req, res) =>{
    // res.send('new user from page');
    res.render('user_add', {
        title : 'Result Management System'
        
    });

});

app.get('/home',(req, res) =>{
    res.render('user_home', {
        title : 'Result Management System'
        
    });

});

app.get('/try_result',(req, res) =>{
    
    res.render('model/Student', {
        title : 'Result Management System'
        
    });

});

app.post('/save',(req, res) => { 
    let data = {Rollno:req.body.Rollno, name:req.body.name, date:req.body.date, score:req.body.score};
 
    let sql = "INSERT INTO student SET ?";
    let query = connection.query(sql, data,(err, results) => {
        if( err & err == "ER_DUP_ENTRY" ){
            next();
          }
          else{
            res.redirect('/teacher');
          }
    });
});
//-------------------------edit user-----------------------------------
app.get('/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from student where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.render('user_edit', {
            title : 'Result Management System',
            user : result[0]
        });
    });
});
//-------------------------update user------------------------------------------
app.post('/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update student SET Rollno='"+req.body.Rollno+"',  name='"+req.body.name+"',  date='"+req.body.date+"', score='"+req.body.score+"' where  id="+userId;
    let query = connection.query(sql,(err, results) => {
        
      res.redirect('/teacher');
    });
});
//---------------------delete user---------------------------
app.get('/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from student where id = ${userId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/teacher');
    });
});

// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});



//Teacher login
app.get('/teacher_login',(req,res) => {

    res.render('teacher_login', {

        title: 'Result Management System',

        

    });
});
//authenticate the teacher  to display the result

app.post("/loginteach",encoder, function(req,res){

    var username = req.body.username;

    var password = req.body.password;
    connection.query("select * from login where  username = ? and password = ?",[username,password] , function(error,results,fields){    

         if(results.length>0)
         {

            res.redirect('/teacher');

          }

         else{
            res.render('errorHandler/error_teacher', {
                title : 'Result Management System'
                
            });

         }

    });

});

