//==========================================================================================
// P5.js
//==========================================================================================

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
                    alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
                    // Permission granted - add listeners
                    // window.addEventListener('devicemotion', handleMotion);
                    // window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch((error) => {
                console.log("Error getting sensor permission: %O", error);
                alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
            });
    } else {
        alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
        // Non-iOS 13+ devices - add listeners directly
        // window.addEventListener('devicemotion', handleMotion);
        // window.addEventListener('deviceorientation', handleOrientation);
    }
}

const permissionButton = document.getElementById('requestPermission');
permissionButton.addEventListener('click', function () {
    if (window.DeviceOrientationEvent) {
        window.addEventListener(
            "deviceorientation",
            (event) => {
                const rotateDegrees = event.alpha; // alpha: rotation around z-axis
                const leftToRight = event.gamma; // gamma: left to right
                const frontToBack = event.beta; // beta: front back motion
                handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
            },
            true,
        );
        alert('test');
    } else {
        alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
    }


    // setMotionListeners();
    // permissionButton.style.display = 'none'; // Hide after permission granted
});

function handleOrientationEvent(frontToBack, leftToRight, rotateDegrees) {
  // do something amazing
  permissionButton.textContent = frontToBack;
}
// function setMotionListeners() {

//     if (typeof DeviceMotionEvent.requestPermission === 'function') {

//         // Note: You can use "DeviceOrientationEvent" here as well

//         DeviceMotionEvent.requestPermission()
//             .catch((error) => {
//                 console.log("Error getting sensor permission: %O", error)
//                 return // Exit out of logic
//             })
//     }

//     // ----------------------------------

//     // At this point...

//     // 1 - Browsers using requestPermission (e.g. Safari iOS)
//     // make it here because users have allowed the above permission.

//     // 2 - Browsers not-using requestPermission (e.g. everyone else)
//     // make it here normally, because they ignore the above 
//     // condition check. Such browsers auto-prompt the user
//     // for permission, when the listener is triggered the very first time.

//     // 3 - Browsers that have no sensors at all
//     // (e.g. the typical desktop device) ignore all of this, 
//     // including your listeners below.

//     // ----------------------------------

//     // Declare your motion and orientation listeners...

// }


function setup() {
    createCanvas(windowWidth, windowHeight);
    gridSize = windowWidth / gridNum;

    setMotionListeners();
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

    tuono.createDSP(audioContext, 1024)
        .then(node => {
            dropNode = node;
            dropNode.connect(audioContext.destination);
            console.log('params: ', dropNode.getParams());
            const jsonString = dropNode.getJSON();
            const jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
            dropNodeParams = jsonParams
            // console.log('parsed object: ', dropNodeParams);
            // const strikePositionObj = dropNodeParams.find(item => item.address === "/englishBell/strikePosition");
            // Get the min value
            // const minValue = strikePositionObj?.min;
            // const maxValue = strikePositionObj?.max;
            // console.log('min value:', minValue, " max value:", maxValue); // Should output: 0
            // console.log('json: ', dropNode.getJSON());
        });
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
    playAudio()

}

//eventss

function playAudio() {
    if (!dropNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    // dropNode.setParamValue("/brass/blower/pressure", Math.pow(Math.abs(rotationX / 180.0))/ 2);
    // dropNode.setParamValue("/brass/blower/pressure", Math.abs(rotationX / 180.0));
    // console.log(Math.pow((mouseX / windowWidth),2))
    // const rotationValueX = Math.abs(rotationX / 180.0)
    // const mouseValueX = (mouseX / windowWidth)
    // dropNode.setParamValue("/brass/blower/pressure", Math.pow(rotationValueX, 2));
    // Need a function before this mmm
    // console.log(dropNodeParams)
    // dropNode.setParamValue("/englishBell/gate", 1);
    // dropNode.setParamValue("/englishBell/strikeCutOff", 1 + (mouseValueX * 2000));
    // setTimeout(() => { dropNode.setParamValue("/englishBell/gate", 0) }, 1);

    // dropNode.setParamValue("/brass/brassModel/tubeLength", mouseY / windowHeight);
    // console.log(mouseX / windowWidth)
    // Quantize tube length to a musical scale
    // const rawTubeLength = mouseY / windowHeight;
    // const mouseValueY = mouseY / windowHeight;
    // const rotationValueY = Math.abs(rotationY / 180.0);
    // const rawTubeLength = rotationValueY;
    // const quantizedTubeLength = quantizeToScale(rawTubeLength);
    // console.log(Math.pow(quantizedTubeLength, 2))
    // dropNode.setParamValue("/brass/brassModel/tubeLength", 0.0001 + Math.pow(quantizedTubeLength, 0.5));
}

function quantizeToScale(value) {
    // Define scale notes (12-tone chromatic)
    const scaleSteps = 5;
    const octaves = 4; // Number of octaves between 0 and 1
    const totalSteps = scaleSteps * octaves;

    // Map value to step number
    const step = Math.round(value * totalSteps);

    // Quantize back to value
    return step / totalSteps;
}

function scaletoParam(address) {

}

function scaletoParam(address) {

}

function mousePressed() {
    if (!dropNode) {
        return;
    }
    dropNode.setParamValue("/thunder/rumble", 1)
    setTimeout(() => { dropNode.setParamValue("/thunder/rumble", 0) }, 100);
    // if (audioContext.state === 'suspended') {
    //     audioContext.resume();
    // }
    // dropNode.setParamValue("/brass/blower/pressure", mouseX / windowWidth);
    // console.log(mouseX / windowWidth)
}

function updateRealtimeVals() {
    // dropNode.setParamValue("/brass/blower/pressure", Math.abs(rotationX / 180.0));
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
    dropNode.setParamValue("/thunder/rumble", 1)
    setTimeout(() => { dropNode.setParamValue("/thunder/rumble", 0) }, 100);
}

//==========================================================================================
// END
//==========================================================================================