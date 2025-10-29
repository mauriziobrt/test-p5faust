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


function setup() {
    createCanvas(windowWidth, windowHeight);
    gridSize = windowWidth / gridNum;


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

    brass.createDSP(audioContext, 1024)
        .then(node => {
            dropNode = node;
            dropNode.connect(audioContext.destination);
            console.log('params: ', dropNode.getParams());
            const jsonString = dropNode.getJSON();
            const jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
            dropNodeParams = jsonParams
            console.log('parsed object: ', dropNodeParams);
            const strikePositionObj = dropNodeParams.find(item => item.address === "/englishBell/strikePosition");
            // Get the min value
            const minValue = strikePositionObj?.min;
            const maxValue = strikePositionObj?.max;
            console.log('min value:', minValue, " max value:", maxValue); // Should output: 0
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
    const rotationValueX = Math.abs(rotationX / 180.0)
    const mouseValueX = (mouseX / windowWidth)
    dropNode.setParamValue("/brass/blower/pressure", Math.pow(rotationValueX, 2));
    // Need a function before this mmm
    // console.log(dropNodeParams)
    // dropNode.setParamValue("/englishBell/gate", 1);
    // dropNode.setParamValue("/englishBell/strikeCutOff", 1 + (mouseValueX * 2000));
    // setTimeout(() => { dropNode.setParamValue("/englishBell/gate", 0) }, 1);

    dropNode.setParamValue("/brass/brassModel/tubeLength", mouseY / windowHeight);
    // console.log(mouseX / windowWidth)
    // Quantize tube length to a musical scale
    // const rawTubeLength = mouseY / windowHeight;
    const mouseValueY = mouseY / windowHeight;
    const rotationValueY = Math.abs(rotationY / 180.0);
    const rawTubeLength = rotationValueY;
    const quantizedTubeLength = quantizeToScale(rawTubeLength);
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
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    DeviceMotionEvent.requestPermission()
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
}

//==========================================================================================
// END
//==========================================================================================

// class Drop {
//     constructor(pos) {
//         this.pos = pos;
//         this.rad = 0;
//         this.life = 255;
//     }

//     update() {
//         this.rad++;
//         this.life -= 3;
//     }

//     draw() {
//         push();
//         stroke(255, this.life);
//         noFill();
//         circle(this.pos.x, this.pos.y, this.rad * 2);
//         pop();
//     }
// }


// const audioContext = new AudioContext();
// let dropNode = null;
// let drops = [];


// function setup() {
//     createCanvas(600, 600);
//     brass.createDSP(audioContext, 1024)
//         .then(node => {
//             dropNode = node;
//             dropNode.connect(audioContext.destination);
//             console.log('params: ', dropNode.getParams());
//         });
// }

// function draw() {
//     background(0);

//     for (const drop of drops) {
//         drop.update();
//         drop.draw();
//     }
//     drops = drops.filter(b => b.life > 0);
// }

// function mousePressed() {
//     if (!dropNode) {
//         // console.log("NOT DROP")
//         return;
//     }
//     if (audioContext.state === 'suspended') {
//         audioContext.resume();
//     }
//     console.log(mouseX / windowWidth)
//     dropNode.setParamValue("/brass/blower/pressure", mouseX / windowWidth);
//     // dropNode.setParamValue("/thunder/rumble", 1);
//     // setTimeout(() => { dropNode.setParamValue("/thunder/rumble", 0) }, 1000);
//     dropNode.setParamValue('/drop/drop', 1.0);
//     // dropNode.setParamValue('/drop/Freeverb/Wet', random());
//     // dropNode.setParamValue('/drop/Freeverb/0x00/Damp', random());
//     // dropNode.setParamValue('/drop/Freeverb/0x00/RoomSize', random());
//     // dropNode.setParamValue('/drop/Freeverb/0x00/Stereo_Spread', random());
//     // dropNode.setParamValue('/drop/freq/0x00', random(440, 880));
//     drops.push(new Drop(createVector(mouseX, mouseY)));
// }

// function mouseReleased() {
//     if (!dropNode) {
//         return;
//     }
//     // dropNode.setParamValue("/thunder/rumble", 0);
//     dropNode.setParamValue('/drop/drop', 0.0);
// }
