import { type PropsWithChildren, useRef, useState } from "react";
import "./tooltip.css";
import { createPortal } from "react-dom";

interface TooltipProps {
	message: string;
}

export function TooltipComponent({ message, children }: PropsWithChildren<TooltipProps>) {
	const [show, setShow] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const onTooltipRender = (element: HTMLDivElement) => {
		if (ref.current == null || element == null) {
			return;
		}

		const { clientWidth, clientHeight } = ref.current;
		const { top, left } = ref.current.getBoundingClientRect();
		const tooltipWidth = element.clientWidth;

		const posLeft = left + clientWidth / 2 - tooltipWidth / 2;
		const posTop = top - (clientHeight / 2 + 40);

		if (tooltipPosition?.top !== posTop || tooltipPosition?.left !== posLeft) {
			setTooltipPosition({ top: posTop, left: posLeft });
		}
	};

	return (
		<>
			{show &&
				createPortal(
					<div ref={onTooltipRender} style={tooltipPosition ? { top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` } : {}} className="tooltip">
						{message}
					</div>,
					document.body,
				)}
			<div ref={ref} className="tooltip-wrapper" onBlur={() => setShow(false)} onFocus={() => setShow(true)} onMouseOver={() => setShow(true)} onMouseLeave={() => setShow(false)}>
				{children}
			</div>
		</>
	);
}
