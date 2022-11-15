var port, textEncoder, writableStreamClosed, writer;

let packet = "";
let readyPacket = "";

let prevRx = 0;
let prevRy = 0;


// Rendering Cube Code

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial({ side: THREE.Doubleside });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// var animate = function () {
//     requestAnimationFrame(animate);
    
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
    
//     renderer.render(scene, camera);
// };
// animate();






//  Reading and writing

async function connectSerial() {
    try {
        // Prompt user to select any serial port.
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: document.getElementById("baud").value });

        textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

        writer = textEncoder.writable.getWriter();
        listenToPort();
    } catch {
        alert("Serial Connection Failed");
    }
}
async function sendCharacterNumber() {
    document.getElementById("lineToSend").value = String.fromCharCode(document.getElementById("lineToSend").value);
}
async function sendSerialLine() {
    dataToSend = document.getElementById("lineToSend").value;
    if (document.getElementById("addLine").checked == true) dataToSend = dataToSend + "\r\n";
    if (document.getElementById("echoOn").checked == true) appendToTerminal("> " + dataToSend);
    await writer.write(dataToSend);
}
async function listenToPort() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    // Listen to data coming from the serial device.
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
        }

        let chunks = value.split("");
        let buffer = "";
        if(chunks.length > 0) {
            chunks.forEach(element => {
                if (element != '\r') {
                    buffer += element;
                }
            });
        }

        appendToTerminal(buffer);

        let bufferChunks = buffer.split("");
        if (bufferChunks.length > 0) {
            bufferChunks.forEach(element => {
                if (element != '\n') {
                    packet += element;
                }  else {
                    readyPacket = packet;
                    packet = "";
                }
            });
        }
        
        if(readyPacket.length > 0) {
            let rotations = readyPacket.split(",");
            
            let currentRx = parseFloat(rotations[0]);
            let currentRy = parseFloat(rotations[1]);
            
            let Rx = currentRx - prevRx;
            let Ry = currentRy - prevRy;

            cube.rotateX(THREE.MathUtils.DEG2RAD * Rx);
            cube.rotateY(THREE.MathUtils.DEG2RAD * Ry);
            
            prevRx = currentRx;
            prevRy = currentRy;
            readyPacket = "";
        }
        
        renderer.render(scene, camera);


    }
}
const serialResultsDiv = document.getElementById("serialResults");
async function appendToTerminal(newStuff) {
    serialResultsDiv.innerHTML += newStuff;
    if (serialResultsDiv.innerHTML.length > 3000) serialResultsDiv.innerHTML = serialResultsDiv.innerHTML.slice(serialResultsDiv.innerHTML.length - 3000);

    //scroll down to bottom of div
    serialResultsDiv.scrollTop = serialResultsDiv.scrollHeight;
}
document.getElementById("lineToSend").addEventListener("keyup", async function (event) {
    if (event.keyCode === 13) {
        sendSerialLine();
    }
})
document.getElementById("baud").value = (localStorage.baud == undefined ? 9600 : localStorage.baud);
document.getElementById("addLine").checked = (localStorage.addLine == "false" ? false : true);
document.getElementById("echoOn").checked = (localStorage.echoOn == "false" ? false : true);
























// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshNormalMaterial({ side: THREE.Doubleside });
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;

// var animate = function () {
//     requestAnimationFrame(animate);
    
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
    
//     renderer.render(scene, camera);
// };
// animate();