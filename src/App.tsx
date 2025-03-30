import { Toaster, toaster } from "@/components/ui/toaster";
import {
	Button,
	Center,
	CloseButton,
	type Color,
	ColorPicker,
	ColorPickerChannelSlider,
	Dialog,
	Field,
	HStack,
	Heading,
	IconButton,
	Image,
	Input,
	Portal,
	SegmentGroup,
	Textarea,
	VStack,
	Wrap,
	parseColor,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdMenu, MdSend } from "react-icons/md";
import { useSearchParams } from "react-router";
import { ColorModeButton } from "./components/ui/color-mode";

const imageSize = 20;
const maxTextLength = 20;

function App() {
	// 処理の状態
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	// 入力の状態
	const [ipAddress, setIpAddress] = useIpAddress();
	const [presetId, setPresetId] = useState<string | null>("1");
	const [fontColor, setFontColor] = useState(parseColor("#f00"));
	const [text, setText] = useState("");
	// 出力の状態
	const [canvasList, setCanvasList] = useState<HTMLCanvasElement[]>([]);

	// テキスト変更時にキャンバスを生成
	useEffect(() => {
		setGenerating(true);
		const newCanvasList = text.split("").map((char) => {
			return textToCanvas(char, fontColor, imageSize, imageSize);
		});
		setCanvasList(newCanvasList);
		setGenerating(false);
	}, [text, fontColor]);

	// キャンバスを Blob に変換・送信
	const handleSend = async () => {
		// 例外処理
		if (generating) {
			return;
		}
		if (!text) {
			toaster.create({
				title: "テキストを入力してください",
				type: "warning",
			});
			return;
		}

		// キャンバスを Blob に変換
		setLoading(true);
		const formData = new FormData();
		const blob = await canvasToBlob(canvasList[0]);
		if (!blob) {
			alert("Blob 変換に失敗しました");
			setLoading(false);
			return;
		}

		// 送信
		formData.append("file", blob, "image.png");
		formData.append("count", String(1));
		fetch(`http://${ipAddress}/contents/${presetId}`, {
			method: "POST",
			body: formData,
		}).then((res) => {
			if (res.ok) {
				toaster.create({
					title: "送信成功",
					type: "success",
				});
			} else {
				toaster.create({
					title: "送信失敗",
					type: "error",
					description: "送信に失敗しました",
				});
			}
			setLoading(false);
		});
	};

	return (
		<>
			<Toaster />
			{/* ヘッダー */}
			<Center
				as="header"
				position="sticky"
				zIndex="sticky"
				px="4"
				py="1"
				shadow="md"
			>
				<HStack w="full" maxW="600px" justifyContent="space-between">
					<Heading color="colorPalette.fg">そふらぼ電光板</Heading>
					<HStack>
						<ColorModeButton />
						{/* ダイアログ表示ボタン */}
						<Dialog.Root>
							<Dialog.Trigger asChild>
								<IconButton variant="ghost" size="xl">
									<MdMenu />
								</IconButton>
							</Dialog.Trigger>
							<Portal>
								<Dialog.Backdrop />
								<Dialog.Positioner>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>設定</Dialog.Title>
										</Dialog.Header>
										<Dialog.CloseTrigger asChild>
											<CloseButton />
										</Dialog.CloseTrigger>
										<Dialog.Body>
											<Field.Root>
												<Field.Label>送信先 IP アドレス</Field.Label>
												<Input
													value={ipAddress}
													onChange={(e) => {
														setIpAddress(e.target.value);
													}}
												/>
											</Field.Root>
										</Dialog.Body>
									</Dialog.Content>
								</Dialog.Positioner>
							</Portal>
						</Dialog.Root>
					</HStack>
				</HStack>
			</Center>

			{/* メイン */}
			<VStack
				justifyContent="center"
				w="full"
				maxW="500px"
				mx="auto"
				my="4"
				p="4"
				spaceY="4"
			>
				{/* プリセット ID 指定フィールド */}
				<Field.Root>
					<Field.Label textWrap="nowrap">プリセット ID</Field.Label>
					<SegmentGroup.Root
						value={presetId}
						onValueChange={(e) => {
							setPresetId(e.value);
						}}
						w="full"
					>
						<SegmentGroup.Indicator />
						<SegmentGroup.Items
							items={["1", "2", "3", "4"]}
							w="full"
							justifyContent="center"
						/>
					</SegmentGroup.Root>
				</Field.Root>

				{/* フォント用カラーピッカー */}
				<ColorPicker.Root
					value={fontColor}
					onValueChange={(e) => {
						setFontColor(e.value);
					}}
					w="full"
				>
					<ColorPicker.HiddenInput />
					<ColorPicker.Label>フォントカラー</ColorPicker.Label>
					<ColorPicker.Control>
						<ColorPicker.Input />
						<ColorPicker.Trigger />
					</ColorPicker.Control>
					<ColorPicker.Positioner>
						<ColorPicker.Content>
							<ColorPicker.Area />
							<ColorPickerChannelSlider channel="hue" />
						</ColorPicker.Content>
					</ColorPicker.Positioner>
				</ColorPicker.Root>

				{/* 送信テキスト入力フィールド */}
				<Field.Root>
					<Field.Label>送信テキスト</Field.Label>
					<Textarea
						size="lg"
						value={text}
						onChange={(e) => {
							setText(e.target.value.trim().slice(0, maxTextLength));
						}}
						placeholder="テキストを入力"
						autoresize
						rows={1}
					/>
					<Field.HelperText alignSelf="end">{text.length}/20</Field.HelperText>
				</Field.Root>

				{/* 送信ボタン */}
				<Button
					loading={loading || generating}
					onClick={handleSend}
					alignSelf="end"
				>
					送信
					<MdSend />
				</Button>

				{/* 生成したキャンバス */}
				<VStack w="full">
					<Heading>送信イメージのプレビュー</Heading>
				</VStack>
				<Wrap w="full" justifyContent="center">
					{canvasList.map((canvas, index) => (
						<Image
							src={canvas.toDataURL()}
							// biome-ignore lint/suspicious/noArrayIndexKey: 順番が変化しないため
							key={index}
							w="80px"
						/>
					))}
				</Wrap>
			</VStack>
		</>
	);
}

export default App;

function textToCanvas(
	text: string,
	fontColor: Color,
	imageWidth: number,
	imageHeight: number,
): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = imageWidth;
	canvas.height = imageHeight;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = `${imageWidth - 2}px sans-serif`;
		ctx.fillStyle = fontColor.toString("css");
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	}
	return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		});
	});
}

function useIpAddress() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ipAddress = searchParams.get("esp-ip") || "";
	const setIpAddress = (value: string) => {
		if (value) {
			setSearchParams({ "esp-ip": value });
		} else {
			setSearchParams({});
		}
	};
	return [ipAddress, setIpAddress] as const;
}
