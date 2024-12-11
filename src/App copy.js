import React, { useRef, useEffect, useState } from 'react';
import anime from 'animejs';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [playState, setPlayState] = useState(0); // 0 = stop, 1 = play, 2 = pause, 4 = previous, 5 = next
  const [currentSecond, setCurrentSecond] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const requestId = useRef(null);
  const stopFlag = useRef(false);

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
    }
  ];

  useEffect(() => {
  if (playState === 1) {
    console.log(currentScene);
    if (currentScene >= scenes.length) {
      setPlayState(0);
      return;
    }
    stopFlag.current = false;
    playScene(scenes[currentScene]);
  } else if (playState === 0) {
    stopFlag.current = true;
    cancelAnimationFrame(requestId.current);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentSecond(0);
    setCurrentScene(0); 
  } else if (playState === 2) {
    stopFlag.current = true;
    cancelAnimationFrame(requestId.current);
    videoRef.current?.pause();
  } else if (playState === 4) {  // Previous scene button logic
    if (currentScene > 0) {
      setCurrentScene((prevScene) => prevScene - 1);
      setCurrentSecond(0);
      setPlayState(1);
    } else {
      alert("first scene.");
    }
  } else if (playState === 5) {  // Next scene button logic
    if (currentScene < scenes.length - 1) {
      setCurrentScene((prevScene) => prevScene + 1);
      setCurrentSecond(0);
      setPlayState(1);
    } else {
      alert("last scene.");
    }
  }
}, [playState, currentScene]);

const playScene = (scene) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const baseUrl = scene.media.split("?")[0];
  const lastSegment = baseUrl.split("/").pop();
  const format = lastSegment.split(".").pop().toLowerCase();

  if (scene.index !== currentScene) {
    setCurrentScene(scene.index);
  }

  if (format === "mp4") {
    const video = videoRef.current;
    if (video.src !== scene.media) {
      video.src = scene.media;
      video.load();
    }
    // Set video to the current second when resuming
    video.currentTime = currentSecond;
    video.play();

    const drawFrame = () => {
      if (playState === 1 && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCurrentSecond(Math.floor(video.currentTime));
        // Check if video has reached scene duration
        if ((video.currentTime >= scene.duration)) {
          video.pause();
          cancelAnimationFrame(requestId.current);
          setCurrentSecond(scene.duration);
          // Stop playback if the last scene is reached
          if (currentScene == scenes.length-1) {
            setPlayState(0); // Stop playback
          } else {
            // Automatically transition to the next scene
            setCurrentScene(currentScene + 1);
            setCurrentSecond(0);
            playScene(scenes[currentScene]);
          }
        } else {
          requestId.current = requestAnimationFrame(drawFrame);
        }
      }
    };
    video.onplay = () => drawFrame();
  } else if (format === "jpeg") {
    const img = new Image();
    img.src = scene.media;
    const startTime = performance.now();
    img.onload = () => {
      const renderImage = (timestamp) => {
        const elapsed = (timestamp - startTime) / 1000;
        if (elapsed < scene.duration && playState === 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setCurrentSecond(Math.floor(elapsed));
          requestId.current = requestAnimationFrame(renderImage);
        } else {
          cancelAnimationFrame(requestId.current);
          // Stop playback if the last scene is reached
          if (currentScene + 1 >= scenes.length) {
            setPlayState(0); // Stop playback
          } else {
            // Automatically transition to the next scene or stop if it's the last scene
            setCurrentScene(prevScene => {
              if (prevScene + 1 >= scenes.length) {
                return prevScene;
              } else {
                return prevScene + 1;
              }
            });
            setCurrentSecond(0);
            playScene(scenes[currentScene + 1]);
          }
        }
      };
      requestId.current = requestAnimationFrame(renderImage);
    };
  }
};    

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
            style={{ backgroundColor: "black" }}
          />
          <video ref={videoRef} style={{ display: "none" }} />
        </div>
        <div className="card-footer">
          <button className="btn btn-dark mb-2" onClick={() => setPlayState(4)}>
            <i className="fas fa-step-backward"></i>
          </button>
          <button className="btn btn-dark mb-2" onClick={() => setPlayState(1)}>
            <i className="fas fa-play"></i>
          </button>
          <button className="btn btn-dark mb-2" onClick={() => setPlayState(2)}>
            <i className="fas fa-pause"></i>
          </button>
          <button className="btn btn-dark mb-2" onClick={() => setPlayState(0)}>
            <i className="fas fa-stop"></i>
          </button>
          <button className="btn btn-dark mb-2" onClick={() => setPlayState(5)}>
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