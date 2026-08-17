// @input Component.Head headBinding
// @input Component.ScriptComponent networkModule 

var frameBuffer = [];
var BATCH_SIZE = 30; // 1 second of data at 30fps

if (!script.headBinding) {
    print("ERROR: Please attach a Head Binding in the Inspector.");
}

var updateEvent = script.createEvent("UpdateEvent");

updateEvent.bind(function (eventData) {
    if (!script.headBinding) return;

    // Get 3D Head Rotation safely
    var headTransform = script.headBinding.getSceneObject().getTransform();
    var eulerRot = headTransform.getWorldRotation().toEulerAngles();

    var frameData = {
        timestamp: getTime(),
        pitch: eulerRot.x, // Looking up/down
        yaw: eulerRot.y,   // Looking left/right
        roll: eulerRot.z   // Tilting head
    };

    frameBuffer.push(frameData);

    if (frameBuffer.length >= BATCH_SIZE) {
        transmitBatch();
    }
});

function transmitBatch() {
    var batchPayload = {
        batch_id: Math.floor(Math.random() * 1000000),
        size: BATCH_SIZE,
        telemetry: frameBuffer
    };

    var jsonString = JSON.stringify(batchPayload);

    if (script.networkModule && script.networkModule.api.sendData) {
        script.networkModule.api.sendData(jsonString);
    } else {
        print("Batched Data Ready! Waiting for Network Module...");
    }

    frameBuffer = [];
}
