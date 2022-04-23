export type ResultTextProps = {
    show: boolean;
    action: () => void;
    text: string;
};

export const ResultText = ({ show, action, text }: ResultTextProps) => {
    return (
        <div
            onTransitionEnd={action}
            className={`my-transition-50 opacity-0 ${
                show && "opacity-100"
            } fs-3 text-uppercase text-nowrap text-light text-center ms-auto`}
        >
            {text}
        </div>
    );
};
