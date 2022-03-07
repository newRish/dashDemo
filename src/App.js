import React, { useEffect, useRef, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { create } from "ipfs-http-client";
import { dataURItoBlob } from "./utils/functions";

const client = create("https://ipfs.infura.io:5001/api/v0");

function App() {
  let videoRef = useRef(null);
  let photoRef = useRef(null);
  const [url, setUrl] = useState("");

  //getting video from camera and rendering in video element
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // taking snap and drawing it on canvas
  const takePicture = async () => {
    const width = 400;
    const height = width / (16 / 9);

    let video = videoRef.current;

    let photo = photoRef.current;

    photo.width = width;

    photo.height = height;

    let ctx = photo.getContext("2d");

    ctx.drawImage(video, 0, 0, width, height);

    // saving snap as data image URI
    const imageURI = photo.toDataURL("image/jpg");
    var blob = dataURItoBlob(imageURI);

    try {
      const added = await client.add(blob);
      console.log(added);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setUrl(url);
    } catch (error) {
      alert(error.message);
      console.log("Error uploading file: ", error);
    }
  };

  const clearImage = () => {
    let photo = photoRef.current;

    let ctx = photo.getContext("2d");

    ctx.clearRect(0, 0, photo.width, photo.height);
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  return (
    <div className="container">
      <h1 className="text-center">IPFS URL: {url}</h1>

      <video ref={videoRef} className="container"></video>

      <button onClick={takePicture} className="btn btn-danger container">
        Take Picture
      </button>

      <canvas className="container" ref={photoRef}></canvas>

      <button onClick={clearImage} className="btn btn-primary container">
        Clear Image
      </button>

      <br />
      <br />
    </div>
  );
}

export default App;
