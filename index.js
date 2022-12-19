const express = require('express');
const app = express();
const port = 3010;
const path = require('path');

const faceAPI = require('./public/JavaScript/index.js');

//app.use(express.static('static'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/LoadModels', (req, res) => {
  res.send('loaded');
});

app.post('/CheckForImage', function (req, res) {
  console.log('receiving data ...');
  console.log('body is ', req.body);
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
