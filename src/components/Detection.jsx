import { useState, useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'
import { create } from 'ipfs';



const Detection = () => {
    const videoHeight = 480;
    const videoWidth = 640;
    const [initalizing, setInitializing] = useState(false);
    const videoRef = useRef();
    const canvasref = useRef();

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + '/models';
            setInitializing(true);
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]).then(startVideo)

        }
        loadModels();
    })

    const startVideo = () => {
        navigator.getUserMedia({
            video: {}
        },
            stream => {
                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = function (e) {
                }
                return stream
            },
            err => console.error(err)
        )
    }


    useEffect(() => {
        videoRef.current && (

            videoRef.current.addEventListener('play', async () => {
                var node = await create()
                const results = await node.add('=^.^= meow meow')
                if (!results) console.log('Error Setting data to ipfs')
                else console.log(results)
                const cid = results.path
                console.log('CID created via ipfs.add:', cid)
                const data = await node.cat(cid)
                console.log('Data read back via ipfs.cat:', data)
                const canvas = faceapi.createCanvasFromMedia(videoRef.current)
                document.body.append(canvas)
                const displaySize = { width: videoRef.current.width, height: videoRef.current.height }
                faceapi.matchDimensions(canvas, displaySize)
                var capturedFrameArray = []
                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
                    const resizedDetections = faceapi.resizeResults(detections, displaySize)
                    // console.log(detections)
                    // console.log(canvas);
                    // if number of faces == 1 
                    // for 3 seconds capture the face

                    if (capturedFrameArray.length < 30) {
                        capturedFrameArray.push(canvas.toDataURL())
                        if (node) {
                            window.ipfs = node
                            const data = await node.add(canvas.toDataURL('image/jpeg'), 0.1)
                            // sign the data
                            // call the mutation
                            window.data = data
                            console.log(data.pat)
                        }

                    }

                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                    faceapi.draw.drawDetections(canvas, resizedDetections)
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
                    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
                    // console.log(resizedDetections)
                    // console.log(detections)
                }, 100)
            })

        )
    }, []);

    return (
        <div>
            <video
                ref={videoRef}
                autoPlay
                muted
                width="720"
                height="560"
            />
            <canvas ref={canvasref}></canvas>
        </div>
    )
}

export default Detection
