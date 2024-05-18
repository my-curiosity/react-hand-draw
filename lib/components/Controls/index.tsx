import StatusLight from "../StatusLight";
import styles from "./styles.module.css";
import hdstyles from "../HandDraw/styles.module.css";

type ControlsProps = {
    controlLightsVisible: boolean;
    webcamReady: boolean;
    modelReady: boolean;
    onWebcamToggle: () => void;
    onCanvasRefresh: () => void;
};

function Controls({
    controlLightsVisible,
    webcamReady,
    modelReady,
    onWebcamToggle,
    onCanvasRefresh
}: ControlsProps) {
    return (
        <div className={`${styles.controls} ${hdstyles.dynamiclayer}`}>
            {controlLightsVisible && (
                <>
                    <StatusLight
                        title="Webcam"
                        status={webcamReady ? "ready" : "wait"}
                    />
                    <StatusLight
                        title="Model"
                        status={modelReady ? "ready" : "wait"}
                    />
                </>
            )}
            <button onClick={onWebcamToggle}>
                {webcamReady ? "Disable webcam" : "Enable webcam"}
            </button>

            <button onClick={onCanvasRefresh}>Clear</button>
        </div>
    );
}

export default Controls;
