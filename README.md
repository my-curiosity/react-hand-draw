# React Hand Draw

A ReactJS component for drawing using hand movements in the air. Utilizes [mediapipe](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/web_js)/[tfjs](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection) handpose detection ML models and [react-webcam](https://github.com/mozmorris/react-webcam); requires a visible hand palm on camera.

## Installation

npm install @my-curiosity/react-hand-draw

## Controls/ How to Use

### Basic idea

A canvas pointer corresponds to the index finger and an action is chosen depending on other fingers' distance to it:

1. middle finger and thumb far away -> draw
2. middle finger near -> point/ wait
3. thumb near -> erase

### Details

Distances from IFT to IFP, MFT and TT points are calculated, the smallest of them determines action:

1. IFT - IFP -> draw
2. IFP - MFT -> point
3. IFP - TT -> erase

(here IFT = index_finger_tip, IFP = index_finger_pip, MFT = middle_finger_tip, TT = thumb_tip as shown [on this diagram](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection#mediapipe-hands-keypoints-used-in-mediapipe-hands))

All relevant points and distances are also shown on top of camera image for clarity. The smallest distance is displayed in green color.

### Color Picker

Moving pointer to a color in the color picker at screen edge sets this color as currently active. Color picker can be customized or disabled using props.

### Buttons

The component also provides buttons for turning the camera on/off and clearing the entire canvas. Users have to enable the camera manually.

### Props

All props are optional, but can be useful for customization.

| prop                      | type                                          | default                                                      | notes                                                           |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| webcamFps                 | number                                        | 60                                                           | webcam frames/second                                            |
| webcamMirrored            | boolean                                       | true                                                         | mirror webcam image                                             |
| webcamVisible             | boolean                                       | true                                                         | show webcam in component                                        |
| controlLightsVisible      | boolean                                       | true                                                         | show if webcam and detector model are ready using status lights |
| detectorRuntime           | "mediapipe" \| "tfjs"                         | "mediapipe"                                                  | choose a detector model type                                    |
| canvasColorPickerPosition | "left" \| "right" \| "up" \| "down" \| "off"  | "up"                                                         | choose color picker position ("off" to disable)                 |
| canvasColorPickerSize     | number                                        | 18                                                           | color picker size (default = 1/18 of the canvas)                |
| canvasColors              | (string \| CanvasGradient \| CanvasPattern)[] | ["red", "pink", "white", "yellow", "green", "blue", "black"] | colors available for color picker                               |
| canvasDefaultColor        | string \| CanvasGradient \| CanvasPattern     | "green"                                                      | default color                                                   |

## Additional Credits

"No Video" icon

https://www.svgrepo.com/svg/157214/no-video

LICENSE: CC0 License

UPLOADER: SVG Repo

## Possible improvements?

Responsiveness: allow changing size of webcam and canvas HTML elements (only 640x480px for now), handle window resizing gracefully.

Make pointer size and line width configurable.

Add some screenshots.

## License

Apache-2.0, see NOTICE and LICENSE.
