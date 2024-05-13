import { HandLandmarker } from "@mediapipe/tasks-vision";
import { Context } from "../types/Context";
import { HandData } from "../types/HandData";

async function estimatePoints(context: Context) {
    if (!context) return;
    const points: HandData = {
        indexPoint: undefined,
        indexPipPoint: undefined,
        middlePoint: undefined,
        thumbPoint: undefined
    };

    let hands;
    if (context.model instanceof HandLandmarker) {
        hands = await context.model.detectForVideo(
            context.draw.video,
            performance.now()
        );
        if (hands.landmarks[0]) {
            if (hands.landmarks[0].length === 21) {
                points.indexPoint = {
                    x: hands.landmarks[0][8].x * context.draw.videoWidth,
                    y: hands.landmarks[0][8].y * context.draw.videoHeight
                };
                points.indexPipPoint = {
                    x: hands.landmarks[0][6].x * context.draw.videoWidth,
                    y: hands.landmarks[0][6].y * context.draw.videoHeight
                };
                points.middlePoint = {
                    x: hands.landmarks[0][12].x * context.draw.videoWidth,
                    y: hands.landmarks[0][12].y * context.draw.videoHeight
                };
                points.thumbPoint = {
                    x: hands.landmarks[0][4].x * context.draw.videoWidth,
                    y: hands.landmarks[0][4].y * context.draw.videoHeight
                };
            }
        }
    } else {
        hands = await context.model.estimateHands(context.draw.video);
        if (hands[0]) {
            for (const keypoint of hands[0].keypoints) {
                if (keypoint.name == "index_finger_tip") {
                    points.indexPoint = keypoint;
                    continue;
                }
                if (keypoint.name == "index_finger_pip") {
                    points.indexPipPoint = keypoint;
                    continue;
                }
                if (keypoint.name == "middle_finger_tip") {
                    points.middlePoint = keypoint;
                    continue;
                }
                if (keypoint.name == "thumb_tip") {
                    points.thumbPoint = keypoint;
                    continue;
                }
            }
        }
    }
    return points;
}

export { estimatePoints };
