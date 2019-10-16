// to try it you have to access live server!!!!

const video = document.getElementById("video");
const button = document.getElementById("start");
let localStream;
let intravl;
// calling faceapi from models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(() => console.log("ready to start"));

const startVideo = () => {
  document.querySelector("#intro").style.display = "none";
  button.removeEventListener("click", startVideo);
  button.style.display = "none";
  navigator.getUserMedia(
    { video: {} },
    stream => {
      video.srcObject = stream;
      localStream = stream;
    },
    err => console.error(err)
  );
};

const welcomePage = () => {
  video.removeEventListener("play", startRecoding);
  localStream.getVideoTracks()[0].stop();
  clearInterval(intravl);
  console.log("Vid off");
  const welcome = document.querySelector("#welcome");
  video.style.display = "none";
  welcome.style.display = "block";
};

const startRecoding = () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  intravl = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    let highPercentage = -1;
    let highExpression = "";
    if (detections[0].expressions) {
      if (detections[0].expressions.happy > 0.99) {
        welcomePage();
      } else {
        const expressionWithPercentage = Object.entries(detections[0].expressions);
        

        expressionWithPercentage.forEach(expr => {
          if (highPercentage < expr[1]) {
            highPercentage = expr[1];

            highExpression = expr[0];
          }
        });
        console.log(highExpression);
      }
    }
  }, 500);
};

video.addEventListener("play", startRecoding);
button.addEventListener("click", startVideo);
