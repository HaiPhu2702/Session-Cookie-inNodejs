
const http=require('http');
const qs = require("qs");
const cookie = require("cookie");
const fs = require("fs");


http.createServer(async (req, res) => {
    let buffer=[];
    if (req.method==="POST"){
        for await (const chunk of req){
            buffer.push(chunk)
        }

        const dataForm=Buffer.concat(buffer).toString();
        const user=qs.parse(dataForm)


        res.setHeader('set-cookie',cookie.serialize('name',String(user.name),{
            httpOnly:true,
            maxAge:60*60*24*7
        }))


        fs.readFile('./views/home.html',"utf-8",(err, data)=>{
            if(err) throw err;
            res.writeHead(200,{"Content-Type":"text/html"})
            data=data.replace('{name}',user.name)
            res.write(data)
            res.end();
        })
    }else {
        fs.readFile('./views/yTe.html',"utf-8",(err, data)=>{
            if(err) throw err;
            res.writeHead(200,{"Content-Type":"text/html"})
            res.write(data)
            res.end();
        })
    }
}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
})