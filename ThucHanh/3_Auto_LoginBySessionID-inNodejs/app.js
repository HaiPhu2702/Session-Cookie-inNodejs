const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const ls = require('local-storage');
const mysql = require("mysql");

const connection=mysql.createConnection({
    location:"localhost",
    user:"root",
    password:"Matkhau1234@@",
    database:"test_connection",
    charset:"utf8_general_ci"
})

connection.connect(err =>{
    if(err) throw err;
    console.log("connection success")
})

http.createServer((req, res) =>{
  readSession(req,res)
}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
    }
)


const handlers={}
handlers.login=function (req, res) {
    fs.readFile('./views/login.html', function (err,data){
        if (err) {
            throw err;
        }
        res.writeHead(200,{"Content-Type": "text/html"})
        res.write(data)
        res.end();
    })
}

handlers.notfound=function (req, res) {
    fs.readFile('./views/notfound.html', "utf-8",function (err,data){
        if (err) {
            throw err;
        }
        res.writeHead(200,{"Content-Type": "text/html"})
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

        //- Lấy thông tin từ form login
        const user=qs.parse(data);

        //- Tạo thời gian hết hạn cho sessionId
        const expires = Date.now() + 1000*60*60;

        // tao IDSession
       let IDSession= createRandomIDToken(20);

        //- Tạo chuỗi để ghi vào sessionId
       const tokenSession= `
       name:"${user.name}",
       email:"${user.email}",
       password:"${user.password}",
       expires:"${expires}"
       `
        //- Ghi sessionId vào server
        createTokenSession(IDSession,tokenSession)
        // luu sessionId phia client
        ls.set('token',IDSession)

        // show info page
        fs.readFile('./views/info.html',"utf-8",(err, data)=>{
            if(err) throw err;
            res.writeHead(200,{"Content-Type":"text/html"})

            data=data.replace("{name}",user.name)
            data=data.replace("{email}",user.email)
            data=data.replace("{password}",user.password)
            res.write(data)
            return res.end();
        })


        req.on('error', function(err){
            throw err;
        })


    }
}

function createTokenSession(PathName, data){
    fs.writeFile(`./token/${PathName}`,data,err=>{
        if (err){
            throw err;
        }
        console.log("create token session success")
    })

}

function createRandomIDToken(number){
    const bigString="abcdefghijklmnopqrztuvwsy0123456789"
    if(typeof number === "number" && number > 0){
        let IDToken=''
        for (let i = 0; i <number ; i++) {
             IDToken+=bigString.charAt(Math.floor(Math.random()*bigString.length))
        }
        return IDToken;
    }else {
        return false;
    }
}

const router={
    "login":handlers.login,
    "notfound":handlers.notfound,
    "info":handlers.info
}

// lay IDSession tu localstorage và đọc tương ứng dữ liệu từ sever
  const readSession=(req,res) => {

      //lấy idSession từ localstorage
      const IDSession=ls.get('token')
      console.log(IDSession)
      if(IDSession){
          //đọc IDsession tương ứng bên sever
          fs.readFile(`./token/${IDSession}`,"utf-8",(err,data)=>{
              if(err) {
                  console.log(err)
                  return;
              }

              const dataIDSession = qs.parse(data)
            console.log(dataIDSession.name)

              //lấy time hêt han
             const  expires=dataIDSession.expires;
              //lay time now
              let now=Date.now();

              if(expires<now){
                  //dang nhap nhung het han IDSession ,can dang nhap lai
                  const URl=url.parse(req.url,true)
                  const pathName=URl.pathname;
                  const trimPath=pathName.replace(/^\/+|\/$/,'')
                  const chooseHandler=((typeof router[trimPath])!=="undefined")?router[trimPath]:handlers.notfound;
                  chooseHandler(req,res);

              }else{
                  // dang nhap, chua het han sang trang khac
                  fs.readFile('./views/dashboard.html',"utf-8",(err, data)=>{
                      if(err) throw err;

                      data=data.replace('{name}',dataIDSession.name);
                      data=data.replace('{email}',dataIDSession.email);
                      res.writeHead(200,{"Content-Type": "text/html"})
                      res.write(data);
                      return res.end();
                  })
              }
          })

      }else{
          //chua dang nhap
          const URl=url.parse(req.url,true)
          const pathName=URl.pathname;
          const trimPath=pathName.replace(/^\/+|\/$/g,'')
          const chooseHandler=(typeof (router[trimPath])!=="undefined")?router[trimPath]:handlers.notfound;
          chooseHandler(req,res);
      }


  }

























