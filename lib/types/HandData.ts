import { Keypoint } from "@tensorflow-models/hand-pose-detection";

export type HandData = {
    indexPoint: Keypoint | undefined;
    indexPipPoint: Keypoint | undefined;
    middlePoint: Keypoint | undefined;
    thumbPoint: Keypoint | undefined;
};
