const faceapi = require('./../FRModels/face-api.min.js');
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
async function loadRequiredModels() {
  try {
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
    ]).then(logData());
  } catch (ex) {}
}
loadRequiredModels();

function logData() {
  try {
    console.log('Loaded Models');
  } catch (ex) {
    console.log(ex);
  }
}
