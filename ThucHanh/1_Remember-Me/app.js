
const  cookie=require("cookie");
const escapeHtml=require("escape-html");
const http=require("http");
const url=require("url");


http.createServer((req, res) => {
    const query =url.parse(req.url,true).query;

    // if(query && query.name && query.remember) {
    //
    //     //set cookie
    //     res.setHeader('set-cookie',cookie.serialize('name',String(query.name),{
    //         httpOnly:true,
    //         maxAge:60*60*24*7,
    //         secure:true,
    //         expires:new Date("2022-06-14")
    //     }))
    //     //back after setting cookie
    //     res.statusCode=302;
    //     res.setHeader('Location',req.headers.referer || '/');
    //     res.end();
    //     return ;
    // }
    //
    // // doc ma cookie da dc set trong ung dung
    //
    // const cookies = cookie.parse(req.headers.cookie || '')
    // const name = cookies.name
    //
    // res.setHeader('Content-Type',"text/html;charset=utf-8");


    if(query&& query.name && query.remember){
        res.setHeader('set-cookie',cookie.serialize('name',String(query.name),{
            httpOnly:true,
            maxAge:60*60*24*7
        }))

        res.statusCode=302;
        res.setHeader("location",req.headers.referer || '/')
        res.end();
        return ;
    }

    const cookies = cookie.parse(req.headers.cookie || '')
    const name = cookies.name;

    res.setHeader('Content-Type', 'text/html;charset=utf-8')


    if (name) {
        res.write('<form method="GET">');
        res.write('<p>Welcome back, <b>' + escapeHtml(name) + '</b>!</p>');
        res.write('<input placeholder="enter your name" name="name" value="' + escapeHtml(name) + '"></br>');
        res.write('<input type="checkbox" id="remember" name="remember" value="true">\n' +
            '<label for="vehicle2"> Remember me</label><br>');
        res.write('<input type="submit" value="Set Name">');
    } else {
        res.write('<form method="GET">');
        res.write('<p>Hello, new visitor!</p>');
        res.write('<input placeholder="enter your name" name="name" value=""></br>');
        res.write('<input type="checkbox" id="remember" name="remember" value="true">\n' +
            '<label for="vehicle2"> Remember me</label><br>');
        res.write('<input type="submit" value="Set Name">');
        res.end('</form>');
    }


}).listen(8080,()=>{
    console.log("server listening http://localhost:8080")
})