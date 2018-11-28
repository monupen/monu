var webcam = document.getElementById('webcam');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');


var oldLeftEye = new Array(2);
var oldRightEye = new Array(2);
var oldNose = new Array(2);


var leftMode = 0;
var leftInterval = 10;

var closeFlag = false;

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild( stats.domElement );

function enablestart() {
    var startbutton = document.getElementById('startbutton');
    startbutton.value = "start";
    startbutton.disabled = null;
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
    // set up stream

    var videoSelector = {video : true};
    if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
        var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
        if (chromeVersion < 20) {
            videoSelector = "video";
        }
    };

    navigator.getUserMedia(videoSelector, function( stream ) {
        if (webcam.mozCaptureStream) {
            webcam.mozSrcObject = stream;
        } else {
            webcam.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        webcam.play();
    }, function() {
        //insertAltVideo(vd);
        //document.getElementById('gum').className = "hide";
        //document.getElementById('nogum').className = "nohide";
        //alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
    });
} else {
    //insertAltVideo(vid);
    //document.getElementById('gum').className = "hide";
    //document.getElementById('nogum').className = "nohide";
    //alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

webcam.addEventListener('canplay', onLoadWebcam, false);

function onLoadWebcam() {
    enablestart();
}




function start() {
    startVideo();
}
function startVideo() {
    // start video
    webcam.play();
    // start tracking
    ctrack.start(webcam);
    // start loop to draw face
    drawLoop();
}

function drawLoop() {
    requestAnimFrame(drawLoop);
    overlayCC.clearRect(0, 0, 400, 300);
    if (ctrack.getCurrentPosition()) {
        ctrack.draw(overlay);
    }


    var list = ctrack.getCurrentPosition();
    if (list.length > 50) {

        var leftEye = list[27];
        var rightEye = list[32];
        var nose = list[37];

        var dxLE = leftEye[0] - oldLeftEye[0];
        var dyLE = leftEye[1] - oldLeftEye[1];
        var dLE = Math.sqrt(dxLE*dxLE+dyLE*dyLE);

        var dxRE = rightEye[0] - oldRightEye[0];
        var dyRE = rightEye[1] - oldRightEye[1];
        var dRE = Math.sqrt(dxRE*dxRE+dyRE*dyRE);

        var dxN = nose[0] - oldNose[0];
        var dyN = nose[1] - oldNose[1];
        var dN = Math.sqrt(dxN*dxN+dyN*dyN);

        var dyLE = leftEye[1] - oldLeftEye[1];
        var dyRE = rightEye[1] - oldRightEye[1];
        var dyN = nose[1] - oldNose[1];


        //１回検出後はすぐに検出しないようにする
        if (leftInterval < 0) {
            //目が下方向（yの+方向）にある程度動いた場合（目を閉じた）
            if (dyLE > 0.5) {
                //鼻の変化量dNより目の変化量dLEのほうが大きい
                if (dLE - dN > 0.3) {
                    if (leftMode == 0) {
                        leftMode = 1;
                    } else {
                        leftMode = 0;
                    }
                    leftInterval = 10;
                    onChangeMode();
                }
            }
        }


        oldLeftEye[0] = leftEye[0];
        oldLeftEye[1] = leftEye[1];
        oldRightEye[0] = rightEye[0];
        oldRightEye[1] = rightEye[1];
        oldNose[0] = nose[0];
        oldNose[1] = nose[1];


        //overlayCC.beginPath();
        overlayCC.rect(270, 200, 100, 100);
        if (leftMode == 0) {
            overlayCC.fillStyle = 'rgb(255, 255, 0)';
        } else {
            overlayCC.fillStyle = 'rgb(255, 0, 0)';
        }
        overlayCC.fill();



        leftInterval--;

    }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
    stats.update();
}, false);
