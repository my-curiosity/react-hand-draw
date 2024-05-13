import { Context } from "../types/Context";
import { HandData } from "../types/HandData";

async function estimatePoints(context: Context) {
    if (!context) return;
    const hands = await context.model.estimateHands(context.draw.video);
    const points: HandData = {
        indexPoint: undefined,
        indexPipPoint: undefined,
        middlePoint: undefined,
        thumbPoint: undefined
    };

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
    return points;
}

export { estimatePoints };
