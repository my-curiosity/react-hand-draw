import styles from "./styles.module.css";

type StatusLightProps = {
    title: string;
    status: "ready" | "wait";
};

function StatusLight({ title, status }: StatusLightProps) {
    return (
        <>
            <p>{title}</p>
            <svg
                className={`${status === "ready" ? styles.green : styles.red}`}
            >
                <circle cx="4" cy="4" r="4" />
            </svg>
        </>
    );
}

export default StatusLight;
