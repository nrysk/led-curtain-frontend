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

export async function fileToCanvas(
	file: File,
	imageWidth: number,
	imageHeight: number,
): Promise<HTMLCanvasElement> {
	return new Promise((resolve) => {
		const canvas = document.createElement("canvas");
		canvas.width = imageWidth;
		canvas.height = imageHeight;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			const image = new Image();
			image.src = URL.createObjectURL(file);
			image.onload = () => {
				ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
				resolve(canvas);
			};
		} else {
			resolve(canvas);
		}
	});
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		});
	});
}
