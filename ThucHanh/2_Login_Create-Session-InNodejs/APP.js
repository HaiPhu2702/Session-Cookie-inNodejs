
const http = require('http');
const mysql = require('mysql');
const url = require('url');
const fs = require("fs");
const qs = require("qs");

const connection=mysql.createConnection({
    location:"localhost",
    user:"root",
    password:"Matkhau1234@@",
    database:"test_connection",
    charset:"utf8_general_ci"
})

connection.connect(err=>{
    if (err) throw err;
    console.log("connection success")
})

http.createServer(async (req, res) => {
    const URL=url.parse(req.url,true)
    const pathName = URL.pathname;
    const trimPath=pathName.replace(/^\/+|\/$/g,'')

    const chooseHandler=((typeof router[trimPath]) !=='undefined')? router[trimPath]:handlers.notfound
    chooseHandler(req,res)


}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
})


const handlers={};

handlers.home=async function (req, res) {
if(req.method==="POST"){
    let buffer=[];
    for await (const chunk of req){
        buffer.push(chunk)
    }
    const data = Buffer.concat(buffer).toString();
    const user=qs.parse(data);

    const expires=Date.now()+1000*60*60;
    const token=`{
    name:"${user.name}",
    email:"${user.email}",
    password:"${user.password}",
    expires:"${expires}"
    }
    `

    createTokenSession(token)

    fs.readFile("./views/homepage.html", "utf8",(err, datahtml) => {
        if (err) throw err;
        datahtml=datahtml.replace('{name}',user.name);
        datahtml=datahtml.replace('{email}',user.email);
        datahtml=datahtml.replace('{password}',user.password);

        res.writeHead(200,{"Content-Type":"text/html"})
        res.write(datahtml)
        res.end();

    })
}
}

handlers.login=function (req, res) {
    fs.readFile('./views/login.html',(err, data)=>{
        if (err) throw err;
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data)
        res.end();
    })
}

handlers.notfound=function (req, res) {
    fs.readFile('./views/notfound.html',(err, data)=>{
        if (err) throw err;
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data)
        res.end();
    })
}

const router={
    "home":handlers.home,
    "login":handlers.login,
    "notfound":handlers.notfound
}
function createTokenSession(data){
    const IDToken=createRandomString(20)
    fs.writeFile(`./token/${IDToken}`,data,err=>{
        if(err) throw err;
        console.log("Write token successfully");
    })

}

function createRandomString(number){
    let stringBig="abcdefghiklmnopqwerszx1234567890"

    if(typeof number==="number" && number >10){
        let IDTokenRandom='';
        for (let i = 0; i <number ; i++) {
            IDTokenRandom+=stringBig.charAt(Math.floor(Math.random()*stringBig.length))
        }
        return IDTokenRandom;
    }
    else {
        return false;
    }

}