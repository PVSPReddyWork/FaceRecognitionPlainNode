const faceapi = require('./../FRModels/face-api.min.js');
const { CustomLogger } = require('./CustomLogger.js');
const https = require('https');
//const faceapi = require('face-api.js');
//const nodeFetch = require('node-fetch');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

const path = require('path');
//const MODELS_PATH = path.join(__dirname, './../FRModels');
const MODELS_PATH = path.join(__dirname, './../ModelsEdited');
//const MODELS_PATH = './../FRModels';
//globalThis.fetch = fetch;

// Make face-api.js use that fetch implementation
faceapi.env.monkeyPatch({ fetch: nodeFetch });

const APIAccessCode =
  'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1';
const FolderAccessCode = '1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';

var labeledImagesPaths = [];
var faceDescriptions = [];
var faceMatcher = null;
async function loadRequiredModels() {
  try {
    faceDescriptions = [];
    faceMatcher = null;
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
    ]).then(AccessDriveImages(FolderAccessCode));
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
async function loadDataBase(labeledImagesPaths) {
  try {
    const labeledFaceDescriptors = await loadLabeledImages(labeledImagesPaths);
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    logData();
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
function loadLabeledImages(paths) {
  const labels = paths;
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      label.filesList.map(async (fileItem) => {
        const imgSource = 'data:image/jpeg;base64,' + fileItem.base64;
        const img = new Image();
        img.src = imgSource;
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        //descriptions.push(detections.descriptor);
        faceDescriptions.push(detections.descriptor);
      });
      return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
    })
  );
}
async function AccessDriveImages(accessID) {
  //divPopupDisplay.style.visibility = 'hidden';
  var urlPart1 = 'https://script.google.com/macros/s/';
  var id = APIAccessCode; //'AKfycbzY7Ur9TbvrbQUlak3NSXvI_Oe8uIcq09Wxizm2HK67MFfNk4A090dPav_su-Q39Gr4'; //"AKfycbwPQZSMXpm2vtSsKYMRY12kENwd9n1rZyJAi_bSldBONoOUKvTEw90f4WIYFLEgU4b0";
  var extension = '/exec';
  var serviceURL = urlPart1 + id + extension;
  var headerObj = 'Contenttype=application/json&userRequest=FileAccess';
  var obj = {
    method_name: 'allFilesInFoldersListFormat',
    service_request_data: { folder_id: accessID },
  };
  var dbParam = JSON.stringify(obj);
  var serviceURLFinal = serviceURL + '?' + headerObj;
  /**/
  var options = {
    hostname: serviceURLFinal,
    agent: https.Agent({ keepAlive: true }),
    //port: 443,
    // path: '/post.php',
    //method: 'POST',
    /*
    headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': postData.length
       }
       * /
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      //process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(dbParam);
  req.end();
/**/
  /** /
  await nodeFetch(serviceURLFinal, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //mode: 'cors', // no-cors, *cors, same-origin
    //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    //redirect: 'follow', // manual, *follow, error
    //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: dbParam, // body data type must match "Content-Type" header
  })
    .then((response) => response.json())
    .then((responseObject) => {
      CustomLogger.DataLogger(responseObject);
    })
    .catch((ex) => {
      CustomLogger.ErrorLogger(ex);
    });
  /**/
  /*
  var xobj = new XMLHttpRequest();
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == 200) {
      var responseData = xobj.response;
      if (responseData != '') {
        var options = JSON.parse(responseData);
        var folderItemsList = options.folder_items;
        for (i = 0; i < folderItemsList.length; i++) {
          //console.log(folderItemsList[i]);
          const alteredGoogleURL =
            'https://drive.google.com/uc?id=' + folderItemsList[i].id;
          labeledImagesPaths.push(folderItemsList[i]);
        }
        loadDataBase();
      } else {
        CustomLogger.MessageLogger(
          'Folder is empty, please provide a valid folder id'
        );
      }
    } else {
    }
  };
  if (accessID == '') {
    xobj.open('GET', serviceURL, true);
    xobj.send();
  } else {
    var headerObj = 'Contenttype=application/json&userRequest=FileAccess';
    var obj = {
      method_name: 'allFilesInFoldersListFormat',
      service_request_data: { folder_id: accessID },
    };
    var dbParam = JSON.stringify(obj);
    xobj.open('POST', serviceURL + '?' + headerObj, true);
    xobj.send(dbParam);  
  }
  */
}
loadRequiredModels();
function logData() {
  try {
    CustomLogger.MessageLogger('Loaded Models, You can work on it now');
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
