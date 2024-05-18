import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import Webcam from "react-webcam";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
    Keypoint,
    SupportedModels,
    createDetector
} from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import {
    clear,
    draw,
    drawColorSelector,
    updateActiveColor
} from "../../util/draw";
import { Color } from "../../types/Color";
import { estimatePoints } from "../../util/estimate";
import { Context } from "../../types/Context";
import { ColorPickerPosition } from "../../types/ColorPickerPosition";
import { HandData } from "../../types/HandData";
import Controls from "../Controls";

type HandDrawProps = {
    webcamFps?: number;
    webcamMirrored?: boolean;
    webcamVisible?: boolean;
    controlLightsVisible?: boolean;
    detectorRuntime?: "mediapipe" | "tfjs";
    canvasColorPickerPosition?: ColorPickerPosition;
    canvasColorPickerSize?: number;
    canvasColors?: Color[];
    canvasDefaultColor?: Color;
};

export function HandDraw({
    webcamFps = 60,
    webcamMirrored = true,
    webcamVisible = true,
    controlLightsVisible = true,
    detectorRuntime = "mediapipe",
    canvasColorPickerPosition = "right",
    canvasColorPickerSize = 18,
    canvasColors = ["red", "pink", "white", "yellow", "green", "blue", "black"],
    canvasDefaultColor = "green"
}: HandDrawProps) {
    const [webcamActive, setWebcamActive] = useState(false);
    const [context, setContext] = useState<Context>(null);

    const webcamRef = useRef<Webcam & HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoCanvasRef = useRef<HTMLCanvasElement>(null);
    const ptrCanvasRef = useRef<HTMLCanvasElement>(null);

    const videoConstraints = {
        width: 640,
        height: 480,
        fps: webcamFps,
        facingMode: "user"
    };

    let activeColor: Color = canvasDefaultColor;
    let lastIndexPoint: Keypoint;

    const initHandDetection = async () => {
        if (
            webcamRef.current?.video?.readyState === 4 &&
            canvasRef.current &&
            ptrCanvasRef.current &&
            videoCanvasRef.current
        ) {
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            const ctx = canvasRef.current.getContext("2d");

            ptrCanvasRef.current.width = videoWidth;
            ptrCanvasRef.current.height = videoHeight;
            const ptrCtx = ptrCanvasRef.current.getContext("2d");

            videoCanvasRef.current.width = videoWidth;
            videoCanvasRef.current.height = videoHeight;
            const videoCtx = videoCanvasRef.current.getContext("2d");

            let detector;
            if (detectorRuntime === "mediapipe") {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                detector = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
                    },
                    numHands: 1
                });
                await detector.setOptions({ runningMode: "VIDEO" });
            } else {
                detector = await createDetector(
                    SupportedModels.MediaPipeHands,
                    {
                        runtime: detectorRuntime,
                        modelType: "full",
                        maxHands: 1
                    }
                );
            }

            setContext({
                model: detector,
                draw: {
                    video: video,
                    videoHeight: videoHeight,
                    videoWidth: videoWidth,
                    ctx: ctx,
                    videoCtx: videoCtx,
                    ptrCtx: ptrCtx
                }
            });
        } else {
            //console.log("video stream not ready, retrying...");
            setTimeout(() => {
                initHandDetection();
            }, 1000);
        }
    };

    const estimateAndDraw = async () => {
        //console.log("entering e/d", webcamActive, context);
        if (!context?.draw || !webcamRef.current) {
            context?.draw.videoCtx?.clearRect(
                0,
                0,
                context.draw.videoCtx.canvas.width,
                context.draw.videoCtx.canvas.height
            );
            //console.log("...exiting e/d");
            return;
        } else {
            clear(context.draw);

            const {
                indexPoint,
                indexPipPoint,
                middlePoint,
                thumbPoint
            }: HandData = (await estimatePoints(context)) as HandData;

            if (indexPoint && indexPipPoint && middlePoint && thumbPoint) {
                activeColor = updateActiveColor(
                    context.draw,
                    indexPoint,
                    canvasColorPickerPosition,
                    canvasColorPickerSize,
                    canvasColors,
                    activeColor
                );

                draw(
                    context.draw,
                    {
                        lastIndexPoint: lastIndexPoint,
                        indexPoint: indexPoint,
                        indexPipPoint: indexPipPoint,
                        middlePoint: middlePoint,
                        thumbPoint: thumbPoint
                    },
                    activeColor
                );

                drawColorSelector(
                    context.draw,
                    canvasColors,
                    canvasColorPickerPosition,
                    canvasColorPickerSize
                );

                lastIndexPoint = indexPoint;
            }
            setTimeout(() => {
                estimateAndDraw();
            }, 1000 / videoConstraints.fps);
        }
    };

    const handleWebcamToggle = () => {
        if (webcamActive) {
            setWebcamActive(false);
        } else {
            setWebcamActive(true);
            initHandDetection();
        }
    };

    const handleCanvasRefresh = () => {
        if (!context?.draw?.ctx || !context?.draw?.videoCtx) {
            //console.log("drawing context unavailable, cannot clear canvas");
            return;
        }
        context.draw.ctx.clearRect(
            0,
            0,
            context.draw.videoCtx.canvas.width,
            context.draw.videoCtx.canvas.height
        );
    };

    useEffect(() => {
        if (context && context.draw.ctx) {
            //console.log("ready");

            estimateAndDraw();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context]);

    return (
        <section
            id={`${styles.container}`}
            className={`${webcamVisible ? styles.dblsize : styles.stdsize}`}
        >
            <Controls
                controlLightsVisible={controlLightsVisible}
                webcamReady={webcamActive}
                modelReady={context?.model != undefined}
                onWebcamToggle={handleWebcamToggle}
                onCanvasRefresh={handleCanvasRefresh}
            />
            <div
                className={`${styles.videocontainer} ${
                    !webcamVisible && styles.invisible
                } ${styles.stack}`}
            >
                {webcamActive && (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        height={480}
                        width={640}
                        videoConstraints={videoConstraints}
                        mirrored={webcamMirrored}
                    />
                )}
                <canvas
                    ref={videoCanvasRef}
                    id="video-canvas"
                    className={`${styles.layer} ${
                        webcamMirrored && styles.mirrored
                    }`}
                ></canvas>
            </div>

            <div className={`${!webcamVisible ? styles.layer : styles.stack} `}>
                <canvas
                    ref={ptrCanvasRef}
                    id="ptr-canvas"
                    className={`${styles.layer} ${
                        webcamMirrored && styles.mirrored
                    }`}
                ></canvas>
                <canvas
                    ref={canvasRef}
                    id="canvas"
                    className={`${styles.layer} ${
                        webcamMirrored && styles.mirrored
                    }`}
                ></canvas>
            </div>
        </section>
    );
}
