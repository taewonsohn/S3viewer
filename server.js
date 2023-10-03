const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const app = express();
const {listFiles,listFolders,deleteFile} = require('./s3');
const port = 3000; 
const chatGPT = require('./chatgpt');



app.use(session({
  secret: 'asdfasdf',
  resave: false,
  saveUninitialized: false
}));


app.use(bodyParser.urlencoded({ extended: true }));


function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {

    next();
  } else {

    res.redirect('/login');
  }
}


app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});


app.post('/authenticate', (req, res) => {
  const { password } = req.body;
  

  if (password === '2330') {

    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login'); 
  }
});
app.get('/make-url',(req,res)=>{
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${req.headers['file-key']}`;
    //console.log(fileUrl);
    res.send(fileUrl);
});
app.get('/delete', async(req,res)=>{
  const key = req.headers['file-key'];
  const response = await deleteFile(key);
  res.send(response);
});
app.get('/files', async (req, res) => {
    const prefix = req.query.folder;
    const result = await listFiles(prefix);

    res.send(result);
  });

app.get('/gpt',async(req,res)=>{
  const texts = decodeURIComponent(req.query.text);
  const response = await chatGPT(texts+'\n 위의 5개의 텍스트 정보로부터 하나의 상품명을 추출해줘. 2가지 이상의 상품이 존재할 경우 먼저 언급된 상품, 더 자주 언급된 상품으로 추출해줘.');
  res.send(response);
});
app.get('/folders', async (req, res) => {
    const result = await listFolders(req.query.userid+'/');
    res.send(result);
  });
app.use(isAuthenticated, express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인에서 접근 가능하도록 설정
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,file-key, Content-Type, Accept, image-count, Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Add the OPTIONS method
    next();
  });
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});