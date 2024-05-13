import { HandDetector } from "@tensorflow-models/hand-pose-detection";
import { DrawContext } from "./DrawContext";

export type Context = {
    model: HandDetector;
    draw: DrawContext;
} | null;
