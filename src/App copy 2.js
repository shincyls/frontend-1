import React, { useRef, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [playState, setPlayState] = useState(0); // 0 = stop, 1 = play, 2 = pause
  const [currentSecond, setCurrentSecond] = useState(0); // Current second of the media
  const [currentScene, setCurrentScene] = useState(0); // Index of the current scene
  const isVideoPlaying = useRef(false); // To track whether the video is playing
  const stopFlag = useRef(false);
  const intervalId = useRef(null);

  const scenes = [
    {
      index: 0,
      sentence: "This is a simple Javascript test",
      textPosition: "middle-center",
      textAnimation: "typing",
      media: "https://miro.medium.com/max/1024/1*OK8xc3Ic6EGYg2k6BeGabg.jpeg",
      duration: 3,
    },
    {
      index: 1,
      sentence: "Here comes the video!",
      textPosition: "top-right",
      textAnimation: "blink",
      media: "https://media.gettyimages.com/id/1069900546/video/good-looking-young-woman-in-casual-clothing-is-painting-in-workroom-then-looking-at-picture.mp4?s=mp4-640x640-gi&k=20&c=yXu7DFG4LhV_ur0oqb59owGqDkVJKzlcWVF-V2l5sM0=",
      duration: 5,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let format = "";
    const animateText = (sentence, position, animationType) => {
      // (Same as before)
    };
  
    const playScene = (scene) => {

      const baseUrl = scene.media.split("?")[0];
      const lastSegment = baseUrl.split("/").pop();
      format = lastSegment.split(".").pop().toLowerCase();
  
      if (currentScene !== scene.index) {
        animateText(scene.sentence, scene.textPosition, scene.textAnimation);
        setCurrentScene(scene.index);
      }
  
      if (stopFlag.current) return; // Prevent further execution if "Stop" is pressed
  
      switch (format) {
        case "mp4":
          const video = videoRef.current;
          if (video.src !== scene.media) {
            video.src = scene.media;
            video.load();
          }
          if (!isVideoPlaying.current && playState === 1) {
            video.currentTime = currentSecond;
            video.play().catch((error) => console.error("Error playing video:", error));
            isVideoPlaying.current = true;
  
            const drawFrame = () => {
              if (playState === 1 && !video.ended) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const videoTime = Math.floor(video.currentTime);
                setCurrentSecond(Math.min(videoTime, scene.duration));
                if (videoTime >= scene.duration) {
                  video.pause();
                } else {
                  requestAnimationFrame(drawFrame);
                }
              }
            };
            video.onplay = () => drawFrame();
          }
          break;
  
          case "jpeg":
            const img = new Image();
            img.src = scene.media;
            let jpegSecond = currentSecond; // Start from the current second
            img.onload = () => {
              if (playState === 1) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear only when playing
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const intervalId = setInterval(() => {
                  if (stopFlag.current) {
                    clearInterval(intervalId);
                    return;
                  }
                  if (playState === 1) {
                    jpegSecond += 1;
                    setCurrentSecond(jpegSecond);
                    if (jpegSecond >= scene.duration) {
                      clearInterval(intervalId);
                    }
                  }
                }, 1000);
              }
            };
            break;
  
        default:
          alert("Media Format Not Supported");
          break;
      }
    };
    

    if (playState === 1) { // Play
      stopFlag.current = false;
      for (let index = currentScene; index < scenes.length; index++) {
        setTimeout(() => {
          if (stopFlag.current) return;
          if (playState === 1) {
            playScene(scenes[index]);
          }
        }, (index - currentScene) * scenes[currentScene].duration * 1000 + currentSecond * 1000);
      }
    } else if (playState === 0) { // Stop
      stopFlag.current = true;
      isVideoPlaying.current = false;
      // Reset Status
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCurrentSecond(0);
      setCurrentScene(0);
      document.getElementById("scene-text")?.remove();
    } else if (playState === 2) { // Pause
      stopFlag.current = true;
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
      // Special Handle for Image Type
      if (format==="jpeg") {
        clearInterval(intervalId); // Ensure the interval stops
      }
      isVideoPlaying.current = false;
    } else if (playState === 4) {
      if (currentScene > 0) {
        setCurrentScene(currentScene - 1);
        setCurrentSecond(0); // Reset playback to the start of the new scene
        // setPlayState(1); // Restart playback
      } else {
        alert("Movie Start");
      }
    } else if (playState === 5) {
      if (currentScene + 1 < scenes.length) {
        setCurrentScene(currentScene + 1);
        setCurrentSecond(0); // Reset playback to the start of the new scene
        // setPlayState(1); // Restart playback
      } else {
        alert("Movie End");
      }
    }

  }, [playState, currentScene, currentSecond]);  


  return (
    <div className="App container text-center mt-4">
      <div className="card">
        <div className="card-header bg-success text-white">
          <h1>Assignment 1 - Video Canvas</h1>
        </div>
        <div className="card-body">
          <canvas
            ref={canvasRef}
            width="800"
            height="450"
            className="border border-primary"
            style={{ backgroundColor: 'black' }}
          />
          <video ref={videoRef} style={{ display: 'none' }} />
        </div>
        <div className="card-footer">
          <button
            className="btn btn-dark btn-circle mb-2"
            onClick={() => setPlayState(4)}
            disabled={currentScene === 0}
          >
            <i className="fas fa-step-backward"></i>
          </button>
          <button
            className="btn btn-dark btn-circle mb-2"
            onClick={() => setPlayState(1)}
            disabled={playState === 1}
          >
            <i className="fas fa-play"></i>
          </button>
          <button
            className="btn btn-dark btn-circle mb-2"
            onClick={() => setPlayState(2)}
            disabled={playState === 0}
          >
            <i className="fas fa-pause"></i>
          </button>
          <button
            className="btn btn-dark btn-circle mb-2"
            onClick={() => setPlayState(0)}
            disabled={playState === 0}
          >
            <i className="fas fa-stop"></i>
          </button>
          <button
            className="btn btn-dark btn-circle mb-2"
            onClick={() => setPlayState(5)}
            disabled={currentScene === scenes.length - 1}
          >
            <i className="fas fa-step-forward"></i>
          </button>
          <div className="mt-2">
            <strong>Current Second: </strong>
            {currentSecond} <br />
            <strong>Current Scene: </strong>
            {currentScene}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
