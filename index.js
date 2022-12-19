const express = require('express');
const app = express();
const port = 3010;
const path = require('path');

const faceAPILocal = require('./public/JavaScript/index.js');

//app.use(express.static('static'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.post('/CheckForImage', function (req, res) {
  console.log('receiving data ...');
  console.log('body is ', req.body);
  res.send(req.body);
});

/**/
app.get('/LoadModels', (req, res) => {
  faceAPILocal.loadRequiredModels();
  res.send('loaded');
});
app.get('/GetImagesData', (req, res) => {
  faceAPILocal.AccessLocalImages();
  res.send('loaded');
});
app.get('/AssignToModels', (req, res) => {
  faceAPILocal.AddImagesToModels();
  res.send('loaded');
});
/**/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
