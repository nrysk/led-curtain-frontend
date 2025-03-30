import type { Color } from "@chakra-ui/react";

export function textToCanvas(
	text: string,
	fontColor: Color,
	bgColor: Color,
	imageWidth: number,
	imageHeight: number,
): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = imageWidth;
	canvas.height = imageHeight;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = bgColor.toString("css");
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = `${imageWidth - 2}px sans-serif`;
		ctx.fillStyle = fontColor.toString("css");
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	}
	return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		});
	});
}
