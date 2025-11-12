//==========================================================================================

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

//==========================================================================================

function getParamMinMax(param) {
    const minValue = param?.min;
    const maxValue = param?.max;
    return [minValue, maxValue]
}

//==========================================================================================

function setMotionListeners() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // alert('Motion sensors permission denied. Please enable in Settings > Safari > Motion & Orientation Access');

    // iOS 13+ requires permission request from user gesture
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log("Permission granted to sensors");
        }
      })
      .catch((error) => {
        console.log("Error getting sensor permission: %O", error);
        alert('Motion sensors permission denied.');
      });
  }
}

//==========================================================================================

const audioContext = new AudioContext();