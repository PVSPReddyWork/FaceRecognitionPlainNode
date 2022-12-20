const faceapiModule = require('./../FRModels/face-api.min.js');
//const faceapiModule = require('face-api.js');
const { CustomLogger } = require('./CustomLogger.js');
const AccessFolders = require('./AccessFolders.js');
const fs = require('fs');
const path = require('path');
const mongoDataBase = require('./MongoDB.js');
const canvas = require('canvas');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

const APIAccessCode =
  'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1';
const FolderAccessCode = '1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';
var labeledImagesPaths = [];
var faceDescriptions = [];
var faceMatcher = null;
var faceapi = faceapiModule;

// Make face-api.js use that fetch implementation
const { Canvas, Image, loadImage, ImageData } = canvas;
faceapi.env.monkeyPatch({ fetch: nodeFetch });
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadRequiredModels = async () => {
  try {
    faceDescriptions = [];
    faceMatcher = null;
    const MODELS_PATH = path.join(__dirname, './../ModelsEdited');

    faceapi.nets.ssdMobilenetv1
      .loadFromDisk(MODELS_PATH)
      .then((result) => {
        console.log('SSD model result >>>>>>');
        console.log(result);
        faceapi.nets.faceRecognitionNet
          .loadFromDisk(MODELS_PATH)
          .then((result) => {
            console.log('faceRecognitionNet result >>>>>>');
            console.log(result);
            faceapi.nets.faceLandmark68Net
              .loadFromDisk(MODELS_PATH)
              .then((result) => {
                console.log('faceLandmark68Net result >>>>>>');
                console.log(result);
                //AccessLocalImages();
              })
              .catch((error) => {
                console.log('faceLandmark68Net error >>>>>>');
                console.log(error);
              });
          })
          .catch((error) => {
            console.log('faceRecognitionNet error >>>>>>');
            console.log(error);
          });
      })
      .catch((error) => {
        console.log('SSD Model error >>>>>>');
        console.log(error);
      });
    /*
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
    ]).then(AccessLocalImages()); //(AccessDriveImages(FolderAccessCode));
    */
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};
async function loadDataBase(labeledImagesPaths) {
  try {
    const labeledFaceDescriptors = await loadLabeledImages(labeledImagesPaths);
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

async function loadLabeledImages(paths) {
  const labels = paths;
  labels.map(async (label) => {
    const descriptions = [];
    label.filesList.map(async (fileItem) => {
      console.log(fileItem.fileURL);
      //const img = await canvas.loadImage(fileItem.fileURL);
      const img = await canvas.loadImage(fileItem.base64);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);
    });
    /**/
    const dbData = {
      label: label.folderName,
      descriptions: descriptions,
    };
    /**/
    //console.log(dbData);
    var responses = await mongoDataBase.SaveFaceDescriptiors([dbData]);
    console.log(responses);
    //CustomLogger.MessageLogger('Data is logged to database');
    //return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
  });
}
const AddDescriptionsToDB = async (folderPath) => {
  try {
    let filesPath = await AccessFolders.GetImagesFromFolders(folderPath, false);
    var data = await loadLabeledImages(filesPath);
    return data;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

/*
async function GetFilesFromFolders(folderPath, folderName = '') {
  try {
    //const LABELED_IMAGES_PATH = path.join(__dirname, './../Pictures');
    const LABELED_IMAGES_PATH = path.join(__dirname, folderPath); //folderPath
    let fileObjects = [];
    await fs.readdirSync(LABELED_IMAGES_PATH).forEach(async (file) => {
      if (!file.toString().includes('.')) {
        let listOfFiles = await GetFilesFromFolders(
          folderPath + '/' + file.toString(),
          file
        );
        if (listOfFiles !== null && listOfFiles !== undefined) {
          const folderObject = {
            folderName: file,
            filesList: listOfFiles,
          };
          fileObjects.push(folderObject);
        }
      } else {
        const imagePath = path.join(
          __dirname,
          folderPath + '/' + file.toString()
        ); //folderPath + '/' + file.toString();
        var imageAsBase64 = await fs.readFileSync(imagePath, 'base64');
        const imageObject = {
          folderName: folderName,
          base64: 'data:image/jpeg;base64,' + imageAsBase64, //'',//'data:image/jpeg;base64,' + imageAsBase64,
          fileURL: imagePath,
        };
        fileObjects.push(imageObject);
        console.log(fileObjects);
      }
    });
    return fileObjects;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
*/

const AccessLocalImages = async () => {
  try {
    CustomLogger.MessageLogger('Loaded Models');
    CustomLogger.MessageLogger('Obtaining Images');
    const allData = await GetFilesFromFolders('./../Pictures');
    labeledImagesPaths = allData;
    CustomLogger.MessageLogger('Obtained Images');
    //CustomLogger.DataLogger(allData);
    //CustomLogger.MessageLogger("Training Models with data");
    //loadLabeledImages(allData);
    //loadDataBase(allData);
    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const AddImagesToModels = async () => {
  try {
    CustomLogger.MessageLogger('Training Models with data');
    var data = await loadLabeledImages(labeledImagesPaths);
    //await GetFilesFromFolders('./../Pictures');
    return data;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};
loadRequiredModels();
module.exports = {
  AddDescriptionsToDB,
};
