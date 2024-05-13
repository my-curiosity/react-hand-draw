import { HandDetector } from "@tensorflow-models/hand-pose-detection";
import { DrawContext } from "./DrawContext";
import { HandLandmarker } from "@mediapipe/tasks-vision";

export type Context = {
    model: HandLandmarker | HandDetector;
    draw: DrawContext;
} | null;
