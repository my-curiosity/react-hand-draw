import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { Color } from "../types/Color";
import { DrawContext } from "../types/DrawContext";
import { HandData } from "../types/HandData";
import { ColorPickerPosition } from "../types/ColorPickerPosition";

function draw(
    context: DrawContext,
    {
        lastIndexPoint,
        indexPoint,
        indexPipPoint,
        middlePoint,
        thumbPoint
    }: HandData & { lastIndexPoint: Keypoint | undefined },
    activeColor: Color
) {
    if (
        !context.ctx ||
        !context.videoCtx ||
        !context.ptrCtx ||
        !indexPoint ||
        !indexPipPoint ||
        !middlePoint ||
        !thumbPoint
    ) {
        return;
    }

    const indexPipDist = dist(indexPipPoint, indexPoint);
    const middleDist = dist(middlePoint, indexPoint);
    const thumbDist = dist(thumbPoint, indexPoint);

    let mode;
    switch (Math.min(indexPipDist, middleDist, thumbDist)) {
        case indexPipDist:
            mode = "drawing";
            break;
        case middleDist:
            mode = "pointing";
            break;
        case thumbDist:
            mode = "clearing";
            break;
    }

    //videoCtx draw
    drawPoint(context.videoCtx, indexPoint.x, indexPoint.y, 4, "green");
    drawPoint(
        context.videoCtx,
        indexPipPoint.x,
        indexPipPoint.y,
        3,
        mode === "drawing" ? "green" : "red"
    );
    drawPoint(
        context.videoCtx,
        middlePoint.x,
        middlePoint.y,
        3,
        mode === "pointing" ? "green" : "red"
    );
    drawPoint(
        context.videoCtx,
        thumbPoint.x,
        thumbPoint.y,
        3,
        mode === "clearing" ? "green" : "red"
    );
    drawLines(
        context.videoCtx,
        [indexPoint, indexPipPoint],
        1,
        mode === "drawing" ? "green" : "red"
    );
    drawLines(
        context.videoCtx,
        [indexPoint, middlePoint],
        1,
        mode === "pointing" ? "green" : "red"
    );
    drawLines(
        context.videoCtx,
        [indexPoint, thumbPoint],
        1,
        mode === "clearing" ? "green" : "red"
    );

    //ptrCtx draw
    switch (mode) {
        case "drawing":
            drawPoint(
                context.ptrCtx,
                indexPoint.x,
                indexPoint.y,
                10,
                activeColor
            );
            break;
        case "pointing":
            drawPoint(
                context.ptrCtx,
                indexPoint.x,
                indexPoint.y,
                3,
                activeColor
            );
            break;
        case "clearing":
            drawPoint(context.ptrCtx, indexPoint.x, indexPoint.y, 9, "white");
            drawPoint(context.ptrCtx, indexPoint.x, indexPoint.y, 6, "black");
            drawPoint(
                context.ptrCtx,
                indexPoint.x,
                indexPoint.y,
                3,
                activeColor
            );
            break;
    }

    //ctx draw
    switch (mode) {
        case "drawing":
            if (lastIndexPoint) {
                drawLines(
                    context.ctx,
                    [lastIndexPoint, indexPoint],
                    6,
                    activeColor
                );
            }
            break;
        case "pointing":
            break;
        case "clearing":
            clearPoint(context.ctx, indexPoint.x, indexPoint.y, 30);
            break;
    }
}

function updateActiveColor(
    context: DrawContext,
    indexPoint: Keypoint,
    colorPickerPosition: ColorPickerPosition,
    colorPickerSize: number,
    colors: Color[],
    activeColor: Color
) {
    switch (colorPickerPosition) {
        case "right":
            if (indexPoint.x < context.videoWidth / colorPickerSize) {
                return colors[
                    Math.floor(
                        (indexPoint.y * colors.length) / context.videoHeight
                    )
                ];
            }
            break;
        case "left":
            if (
                indexPoint.x >
                ((colorPickerSize - 1) * context.videoWidth) / colorPickerSize
            ) {
                return colors[
                    Math.floor(
                        (indexPoint.y * colors.length) / context.videoHeight
                    )
                ];
            }
            break;
        case "up":
            if (indexPoint.y < context.videoHeight / colorPickerSize) {
                return colors[
                    Math.floor(
                        (indexPoint.x * colors.length) / context.videoWidth
                    )
                ];
            }
            break;
        case "down":
            if (
                indexPoint.y >
                ((colorPickerSize - 1) * context.videoHeight) / colorPickerSize
            ) {
                return colors[
                    Math.floor(
                        (indexPoint.x * colors.length) / context.videoWidth
                    )
                ];
            }
            break;
    }
    return activeColor;
}

function clear(context: DrawContext) {
    context.videoCtx?.clearRect(
        0,
        0,
        context.videoCtx.canvas.width,
        context.videoCtx.canvas.height
    );
    context.ptrCtx?.clearRect(
        0,
        0,
        context.ptrCtx.canvas.width,
        context.ptrCtx.canvas.height
    );
}

function drawColorSelector(
    context: DrawContext,
    colors: Color[],
    position: ColorPickerPosition,
    size: number
) {
    if (!context.ctx || position === "off") return;
    context.ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < colors.length; i++) {
        context.ctx.fillStyle = colors[i];
        let startX, startY, width, height;
        switch (position) {
            case "left":
                startX = ((size - 1) * context.video.width) / size;
                startY = (context.video.height / colors.length) * i;
                width = context.video.width / size;
                height = context.video.height / colors.length;
                break;
            case "right":
                startX = 0;
                startY = (context.video.height / colors.length) * i;
                width = context.video.width / size;
                height = context.video.height / colors.length;
                break;
            case "up":
                startX = (context.video.width / colors.length) * i;
                startY = 0;
                width = context.video.width / colors.length;
                height = context.video.height / size;
                break;
            case "down":
                startX = (context.video.width / colors.length) * i;
                startY = ((size - 1) * context.video.height) / size;
                width = context.video.width / colors.length;
                height = context.video.height / size;
                break;
        }
        context.ctx.fillRect(startX, startY, width, height);
    }
}

function dist(p1: Keypoint, p2: Keypoint) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function clearPoint(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number
) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPoint(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: Color
) {
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLines(
    ctx: CanvasRenderingContext2D,
    points: Keypoint[],
    r: number,
    color: Color
) {
    ctx.globalCompositeOperation = "source-over";
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        path.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = r;

    ctx.stroke(path);
}

export { draw, clear, updateActiveColor, drawColorSelector };
