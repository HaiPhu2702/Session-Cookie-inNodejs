
const http = require('http');
const cookie = require('cookie')
const fs = require('fs');


function getView(req){

    let cookies=cookie.parse(req.headers.cookie||'');

    let views =cookies.view;

    if (views){
        return Number(views) + 1;
    }else {
        return 0;
    }
}

http.createServer((req, res)=>{

let views=getView(req);

res.setHeader('set-cookie',cookie.serialize('views',views,{
    httpOnly:true,
    maxAge:60*60*24*7
}))
    console.log(views)
fs.readFile('./views/home.html','utf8',(err, data)=>{
    if (err) throw err;
    data=data.replace('{view}',views)
    res.writeHead(200,{"Content-Type": 'text/html'})
    res.write(data)
    return res.end();
})


}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
})




























