export type DrawContext = {
    video: HTMLVideoElement;
    videoHeight: number;
    videoWidth: number;
    ctx: CanvasRenderingContext2D | null;
    videoCtx: CanvasRenderingContext2D | null;
    ptrCtx: CanvasRenderingContext2D | null;
};
