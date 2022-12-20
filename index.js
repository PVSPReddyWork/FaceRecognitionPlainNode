const express = require('express');
const app = express();
const port = 3010;
const path = require('path');

//const faceAPILocal = require('./public/JavaScript/index.js');
//const mongoDataBase = require('./public/JavaScript/MongoDB.js');
const AccessFolders = require('./public/JavaScript/AccessFolders.js');

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

/* Testing the project*/
app.get('/LoadModels', (req, res) => {
  //faceAPILocal.loadRequiredModels();
  res.send('loaded');
});

app.get('/GetImagesData', async (req, res) => {
  //var data = await faceAPILocal.AddImagesToModels();
  res.send(data);
});

app.post('/GetFilesJSON', async function (req, res) {
  console.log('body is ', req.body);
  await AccessFolders.GetImagesFromFolders(req.body.filesPath, false);
  res.send(req.body);
});
/*
app.get('/AssignToModels', (req, res) => {
  faceAPILocal.AddImagesToModels();
  res.send('loaded');
});
app.get('/testDB', async (req, res) => {
  var response = await mongoDataBase.TestMongoConnection();
  // mongoDataBase.SaveFaceDescriptiors;
  res.send(response);
});
*/
/**/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
