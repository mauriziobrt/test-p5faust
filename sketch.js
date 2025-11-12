//==========================================================================================
// P5.js
//==========================================================================================

// Change here to ("tuono") depending on your wasm file name
const dspName = "tuono";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

const audioContext = new AudioContext();
let dropNode = null;
let drops = [];
let dropNodeParams = null;

let leftMargin = 50; // (50) edit this to change left margin 
let textSiz = 25; // (25)edit this to change text label text size
let gridNum = 15; // (10) edit this to change grid spacing (lower num = larger grid)

let gridSize = 0;

//init only -- edit colours in setup function 
let textCol = 255;
let textAccent = 0;
let targetBgCol = 0;
let bgCol = 0;

//init slider stuff
let sliders = [];
let sliderWidth;
let configLabels = ["shake thresh", "turn axis", "move thresh"];
let threshVals = [0, " ", 0];

//init label stuff
let labels = ["", "Acceleration X", "Acceleration Y", "Acceleration Z", "", "Rotation X", "Rotation Y", "Rotation Z"];
let vals = [];
let stateLabels = ["shaken", "turned", "moved"];
let states = [0, 0, 0];

// Source - https://stackoverflow.com/a
// Posted by Kalnode, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-10, License - CC BY-SA 4.0

const button = document.getElementById('myButton');

button.addEventListener('click', function () {
    if (!dropNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
        button.textContent = 'Stop Audio';
        setMotionListeners()
    } else {
        audioContext.suspend();
        button.textContent = 'Start Audio';
    }
});


function setMotionListeners() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+ requires permission request from user gesture
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    console.log("Permission granted to sensors");
                    // alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
                    // Permission granted - add listeners
                    // window.addEventListener('devicemotion', handleMotion);
                    // window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch((error) => {
                console.log("Error getting sensor permission: %O", error);
                alert('Motion sensors permission denied.');
            });
    }
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    gridSize = windowWidth / gridNum;

    // setMotionListeners();
    //init colours here 
    textCol = color(255);
    targetBgCol = color(0);
    textAccent = color(255, 255, 0);
    bgCol = color(0);

    //init sliders
    sliderWidth = width / 4;
    sliders[0] = createSlider(0, 100, 30, 1); //shaker thresh, 0 - 100, default = 30, step = 1
    sliders[0].position(10, 10);
    sliders[0].size(sliderWidth);
    sliders[2] = createSlider(0, 75, 50, 1); //move thresh, 0 - 75, default = 50, step = 1
    sliders[2].position(10, 10);
    sliders[2].size(sliderWidth);

    // The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
    tuono.createDSP(audioContext, 1024)
        .then(node => {
            dropNode = node;
            dropNode.connect(audioContext.destination);
            console.log('params: ', dropNode.getParams());
            const jsonString = dropNode.getJSON();
            const jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
            dropNodeParams = jsonParams
            const exampleMinMaxParam = findByAddress(dropNodeParams, "/thunder/rumble");
            // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
            const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
            console.log('Min value:', exampleMinValue,'Max value:',  exampleMaxValue);
        });
}


function findByAddress(obj, address) {
  if (obj.address === address) return obj;
  if (Array.isArray(obj)) {
    for (const el of obj) {
      const found = findByAddress(el, address);
      if (found) return found;
    }
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      const found = findByAddress(obj[key], address);
      if (found) return found;
    }
  }
  return null;
}

function getParamMinMax(param) {
    const minValue = param?.min;
    const maxValue = param?.max;
    return [minValue, maxValue]
}

function draw() {
    //update realtime vals
    vals[1] = round(accelerationX, 4);
    vals[2] = round(accelerationY, 4);
    vals[3] = round(accelerationZ, 4);
    vals[5] = round(rotationX, 1);
    vals[6] = round(rotationY, 1);
    vals[7] = round(rotationZ, 1);

    threshVals[0] = sliders[0].value();
    threshVals[2] = sliders[2].value();
    setShakeThreshold(threshVals[0]);
    setMoveThreshold(threshVals[2]);

    //grid spacing
    let gridSlot = 0;

    //fade bg col
    if (bgCol != targetBgCol) {
        bgCol = lerpColor(bgCol, targetBgCol, 0.03);
    }

    //set format stuff
    background(bgCol);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    fill(textCol);
    textSize(textSiz);

    gridSlot++; //add extra space

    // acc and rotate labels + vals
    for (x = 0; x < labels.length; x++) {
        if (labels[x] != "") {
            text(labels[x] + ' = ' + vals[x], leftMargin, (gridSize * gridSlot));
        }
        gridSlot++;
    }

    gridSlot += 2; //extra spacing 

    //shaken, turned, moved alerts
    for (x = 0; x < states.length; x++) {
        fill(255, max((255 * states[x]), 30));
        textSize(70);
        textAlign(LEFT, CENTER);
        text(stateLabels[x], leftMargin, (gridSize * gridSlot) + (70 * x));

        textSize(textSiz - 5);
        textAlign(RIGHT, CENTER);
        fill(255);
        text(configLabels[x] + ' = ' + threshVals[x], width - 20, (gridSize * gridSlot) + (70 * x) - 20);

        //sliders for shaken and moved 
        if (x != 1) {
            sliders[x].position(width - sliderWidth - 20, (gridSize * gridSlot) + (70 * x));
        }

        gridSlot++;
    }

    //fade alert text
    for (x = 0; x < states.length; x++) {
        if (states[x] > 0.1) {
            states[x] -= 0.01;
        }
    }
    // playAudio()

}

//eventss

function playAudio() {
    if (!dropNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    dropNode.setParamValue("/thunder/rumble", 1)
    setTimeout(() => { dropNode.setParamValue("/thunder/rumble", 0) }, 100);
}

function mousePressed() {
    // Use this for debugging from the desktop!
    if (!dropNode) {
        return;
    }
    // dropNode.setParamValue("/thunder/rumble", 1)
    // setTimeout(() => { dropNode.setParamValue("/thunder/rumble", 0) }, 100);
}

function deviceMoved() {
    bgCol = color(0, 0, 255);
    states[2] = 1;
}

function deviceTurned() {
    threshVals[1] = turnAxis;
    bgCol = color(0, 255, 0);
    states[1] = 1;
}
function deviceShaken() {
    bgCol = color(255, 0, 0);
    states[0] = 1;
    playAudio();
}

//==========================================================================================
// END
//==========================================================================================