
const mysql = require('mysql')
const http = require("http");
const fs = require("fs");
const url=require("url");
const qs = require("qs");
const ls=require("local-storage")

const connection=mysql.createConnection({
    location:'localhost',
    user: 'root',
    password: 'Matkhau1234@@',
    database: 'test_connection',
    charset:'utf8_general_ci'
})
connection.connect((err)=>{
    if (err) throw err;
    console.log("connection success")
    });

http.createServer((req, res)=>{
    readSession(req,res);

    }).listen(8080,()=>{

    console.log("sever listening http://localhost:8080")
    })

const handlers={};

handlers.notfound=function (req, res) {
    fs.readFile('./views/notfound.html', 'utf8',(err, data)=>{
        if (err) throw err;
        res.writeHead(200,{"Content-Type":"text/html"})
        res.write(data)
         res.end();
    })
}

handlers.login=function (req, res) {
    fs.readFile('./views/login.html', 'utf8',(err, data)=>{
        if (err) throw err;
        res.writeHead(200,{"Content-Type":"text/html"})
        res.write(data)
         res.end();
    })
}

handlers.info=async function (req, res) {
    let buffer=[];
    if(req.method==="POST"){
        for await (const chunk of req){
            buffer.push(chunk)
        }
        const data=Buffer.concat(buffer).toString();
        const dataForm=qs.parse(data)

        const expires=Date.now()+60*60*1000

        const IDSession=createRandomIDToken(20);

        const sessionData=`name:"${dataForm.name}",email:"${dataForm.email}",phone:"${dataForm.password}",expires:"${expires}"`
        ls.set('token', IDSession);

        createTokenSession(IDSession, sessionData);

        fs.readFile('./views/info.html', "utf-8",(err, data) => {
            if (err) throw err;
            res.writeHead(200,{"Content-Type":"text/html"})

            data=data.replace('{name}',dataForm.name)
            data=data.replace('{email}',dataForm.email)
            data=data.replace('{password}',dataForm.password)


            res.write(data);
            return res.end();
        })

    }

}

const router={
    "notfound":handlers.notfound,
    "login":handlers.login,
    "info":handlers.info
}

 function createRandomIDToken(number){
    let bigString='abcdefghijklemopqrztuvwyz0123456789'
        let IDSession='';
     for (let i = 0; i <number ; i++) {
         IDSession+=bigString.charAt(Math.floor(Math.random()*bigString.length))
     }
    return IDSession;
 }

 function createTokenSession(fileName, sessionData){

    fs.writeFile(`./token/${fileName}`,sessionData,err=>{
        if (err) throw err;
        console.log("createTokenSession success")
        }
    )
 }

const readSession=(req, res)=>{

    const IDSession = ls.get('token')

    if(IDSession){
        fs.readFile(`./token/${IDSession}`,"utf8",(err, data) => {

            if (err) throw err;


            //đưa dataSession tu  string -> object
            let arr = data.split("'")
            console.log(arr)
            let string = `{${arr[0]}}`;
            eval('var obj=' + string);


            //time IDSession
            const expires=obj.expires;



            const dateNow=Date.now();

            if(expires<dateNow){
                //xoa sessionID +dang nhap lai
                deleteSession(IDSession);
                router.login(res,req)

            }else {
                const URL=url.parse(req.url,true);
                const pathName=URL.pathname;
                const trimPath=pathName.replace(/^\/+|\/$/g,'')

                if(trimPath==='logout'){
                    deleteSession(IDSession)
                    router.login(req, res)
                }else {
                   fs.readFile('./views/dashboard.html',"utf-8",(err,data)=>{
                       if(err) throw err;

                       res.writeHead(200,{"Content-Type":"text/html"})
                       data=data.replace('{name}',obj.name)
                       data=data.replace('{email}',obj.email)
                       res.write(data);
                       return res.end();
                   })
                }
            }
        })
    }else {
        //chua dang nhap
        const URl=url.parse(req.url,true)
        const pathName=URl.pathname;
        const trimPath=pathName.replace(/^\/+|\/$/g,'')
        const chooseHandler=(typeof (router[trimPath])!=="undefined")?router[trimPath]:handlers.notfound;
        chooseHandler(req,res);
    }
}

function deleteSession(IDSession){
    fs.unlink(`./token/${IDSession}`,err =>{
        if (err) throw err;
        console.log("deleteSession success")
    })
}















