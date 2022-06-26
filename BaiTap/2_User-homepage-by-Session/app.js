

const http = require('http');
const mysql = require('mysql');
const fs = require("fs");
const ls = require("local-storage");
const qs = require("qs");
const url=require("url");
const cookie = require("cookie");

const connect=mysql.createConnection({
    location:"localhost",
    user: 'root',
    password: 'Matkhau1234@@',
    database:"user",
    charset:"utf8_general_ci"
})

connect.connect(err=>{
    if (err){
        throw err;
    }
    console.log("connect success")

})

http.createServer((req, res) => {

    readSession(req,res)

}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
})


const handlers={};


handlers.home=function (req, res) {
    fs.readFile('./views/home.html', function (err,data){
        if (err) {
            throw err;
        }
        res.writeHead(200,{"Content-Type":"text/html"});
        res.write(data)
        res.end();
    })
}

handlers.login=function (req, res) {
    fs.readFile('./views/login.html', function (err,data){
        if (err) {
            throw err;
        }
        res.writeHead(200,{"Content-Type":"text/html"});
        res.write(data)
        res.end();
    })
}

handlers.profile=async function (req, res) {
let buffer=[];

if(req.method==="POST"){

    for await (const chunk of req){
        buffer.push(chunk)
    }
    const dataForm=Buffer.concat(buffer).toString();
    const user=qs.parse(dataForm)

    const sqlInsert=`insert into Information(Name,Age) values('${user.Name}','${user.Age}')`
    connect.query(sqlInsert,err =>{
        if(err) throw err;
        console.log("insert success")
    })

    const IDSession=CreateRandomSession(20);


    const Expires=Date.now()+60*60*24*7

    const DataSession=`Name:"${user.Name}",Age:"${user.Age}",Expires:"${Expires}"`

    //ghi session vao localstore
    ls.set('token',IDSession)

    //ghi   session vao sever
    writeSessionSever(IDSession,DataSession)

    fs.readFile('./views/profile.html',"utf8",(err, data)=>{
        if (err){
            throw err
        }

        const GetDataMysql=`select * from Information`
        connect.query(GetDataMysql,(err,result)=>{
            if (err){
                throw err;
            }

        })

        res.writeHead(200,{"Content-Type":"text/html"})
        data=data.replace('{name}',user.Name)
        data=data.replace('{age}',user.Age)
        res.write(data)
        res.end()
    })
}
}

const router={
    "home":handlers.home,
    "login":handlers.login,
    "profile":handlers.profile,
}

function CreateRandomSession(number){
    const bigString="abcdefjhijklmnopqrstuvwyz0123456789"
    let IDSession=''
    if (typeof number==="number" && number >0){
        for (let i = 0; i <number ; i++) {
            IDSession+=bigString.charAt(Math.floor(Math.random()*bigString.length))
        }
    }
   return IDSession;
}

function writeSessionSever(IDSession,DataSession){
    fs.writeFile(`./token/${IDSession}`,DataSession,err=>{
        if (err) throw err;
        console.log("write success session")
    })
}


const readSession=(req, res) => {
    const IDSession=ls.get('token')

    if(IDSession){

        fs.readFile(`./token/${IDSession}`,"utf-8",(err,data)=>{
            if (err) throw err;


            let subData = data.split("'")
            let string=`{${subData[0]}}`
            eval('var obj=' + string);

            const expires=obj.Expires;

            const dateNow=Date.now();


            if(expires <dateNow){
                //xoa session
                deleteSession(IDSession);
                router.login(req,res);
            }else{
                const URL=url.parse(req.url,true)
                const pathName=URL.pathname
                const trimPath=pathName.replace(/^\/+|\/$/g,'')

                if(trimPath==="logout"){
                    deleteSession(IDSession);
                    router.login(req,res)
                }else {
                   fs.readFile('./views/dashboard.html',"utf8",(err,data)=>{
                       if(err) {
                           throw err
                       }
                       res.writeHead(200,{"Content-Type": "text/html"})
                       data=data.replace('{name}',obj.Name)
                       data=data.replace('{age}',obj.Age)
                       res.write(data)
                       return res.end()

                   })
                }
            }
        })
    }else {
        const URL=url.parse(req.url,true)
        const pathName=URL.pathname
        const trimPath=pathName.replace(/^\/+|\/$/g,'')

        const chooseHandler=((typeof router[trimPath]) !=='undefined')? router[trimPath]:handlers.home
        chooseHandler(req,res)
    }
}

function deleteSession(IDSession){
    fs.unlink(`./token/${IDSession}`,err => {
        if(err) throw err;
        console.log("deleteSession success")
    })
}














