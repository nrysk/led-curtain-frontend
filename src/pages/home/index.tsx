import { ColorModeButton } from "@/components/ui/color-mode";
import { Toaster, toaster } from "@/components/ui/toaster";
import { InfoTip } from "@/components/ui/toggle-tip";
import { canvasToBlob, fileToCanvas, textToCanvas } from "@/utils";
import {
	Accordion,
	Button,
	Center,
	Field,
	FileUpload,
	Float,
	HStack,
	Heading,
	Image,
	Input,
	NumberInput,
	SegmentGroup,
	Span,
	Tabs,
	Textarea,
	VStack,
	Wrap,
	parseColor,
	useFileUpload,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	MdClose,
	MdImage,
	MdSend,
	MdTextFields,
	MdUpload,
} from "react-icons/md";
import ColorPickerField from "./components/ColorPickerField";
import ProgressActionBar from "./components/ProgressActionBar";
import SettingsDialogButton from "./components/SettingsButton";
import useIpAddress from "./hooks/useIpAddress";

const imageSize = 20;
const maxImageCount = 20;

const Home = () => {
	// 処理の状態
	const [sending, setSending] = useState(false);
	const [sendedCount, setSendedCount] = useState(0);
	const [generating, setGenerating] = useState(false);
	// 入力の状態
	const [tabValue, setTabValue] = useState("text");
	const [ipAddress, setIpAddress] = useIpAddress();
	const [presetId, setPresetId] = useState<string | null>("1");
	const [fontColor, setFontColor] = useState(parseColor("#f00"));
	const [bgColor, setBgColor] = useState(parseColor("#000"));
	const [interval, setInterval] = useState("1");
	const [loopCount, setLoopCount] = useState("1");
	const [text, setText] = useState("");
	const fileUpload = useFileUpload({
		accept: "image/*",
		maxFiles: maxImageCount,
	});
	// 出力の状態
	const [previewCanvasList, setPreviewCanvasList] = useState<
		HTMLCanvasElement[]
	>([]);
	const imageLength = useMemo(() => {
		switch (tabValue) {
			case "text":
				return text.length;
			case "image":
				return fileUpload.acceptedFiles.length;
			default:
				return 0;
		}
	}, [tabValue, text, fileUpload.acceptedFiles]);
	// 参照
	const abortController = useRef<AbortController | null>(null);

	// テキスト・イメージ変更時にキャンバスを生成
	useEffect(() => {
		setGenerating(true);
		let newCanvasList: HTMLCanvasElement[] = [];
		newCanvasList = text.split("").map((char) => {
			return textToCanvas(char, fontColor, bgColor, imageSize, imageSize);
		});
		setPreviewCanvasList(newCanvasList);
		setGenerating(false);
	}, [text, fontColor, bgColor]);

	// イメージ送信ハンドラ
	const handleSend = async () => {
		// 例外処理
		if (generating || sending) {
			return;
		}
		if (!ipAddress) {
			toaster.warning({
				title: "IP アドレスを入力してください",
			});
			return;
		}

		if (tabValue === "text" && !text) {
			toaster.warning({
				title: "テキストを入力してください",
			});
			return;
		}
		if (tabValue === "image" && fileUpload.acceptedFiles.length === 0) {
			toaster.warning({
				title: "イメージを選択してください",
			});
			return;
		}

		setSending(true);
		setSendedCount(0);
		// canvas 一つずつを Blob に変換して送信
		abortController.current = new AbortController();
		let canvasList: HTMLCanvasElement[] = [];
		switch (tabValue) {
			case "text":
				canvasList = previewCanvasList;
				break;
			case "image":
				canvasList = await Promise.all(
					fileUpload.acceptedFiles.map((file) => {
						return fileToCanvas(file, imageSize, imageSize);
					}),
				);
				break;
		}
		console.log(canvasList);

		for (const i in canvasList) {
			const blob = await canvasToBlob(canvasList[i]);
			if (!blob) {
				toaster.error({
					title: "Blob 変換に失敗しました",
				});
				setSending(false);
				return;
			}
			// 送信
			const formData = new FormData();
			formData.append("file", blob, `image${i}.png`);
			formData.append("frameIndex", String(i));
			try {
				await fetch(`http://${ipAddress}/presets/${presetId}/frames`, {
					method: "POST",
					body: formData,
					signal: abortController.current.signal,
				}).then(() => {
					// 送信完了カウントを増やす
					setSendedCount((prev) => prev + 1);
				});
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					toaster.warning({
						title: "送信が中止されました",
					});
				} else {
					toaster.error({
						title: "送信に失敗しました",
					});
				}
				setSending(false);
				return;
			}
			// 負荷軽減のためにスリープ
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve(null);
				}, 100);
			});
		}

		// 総フレーム数を送信
		await fetch(`http://${ipAddress}/presets/${presetId}`, {
			method: "POST",
			body: JSON.stringify({
				totalFrames: imageLength,
				interval: Number(interval) * 1000,
				loopCount: Number(loopCount),
			}),
		});

		// 送信完了
		toaster.success({
			title: "送信完了",
		});

		setSending(false);
	};

	return (
		<>
			{/* トースト */}
			<Toaster />

			{/* プログレスバー */}
			<ProgressActionBar
				open={sending}
				value={Math.floor((sendedCount / imageLength) * 100)}
				onCancel={() => {
					if (abortController.current) {
						abortController.current.abort();
					}
					setSending(false);
				}}
			/>

			{/* ヘッダー */}
			<Center as="header" position="sticky" zIndex="sticky" shadow="md">
				<HStack
					w="full"
					height="50px"
					maxW="600px"
					justifyContent="space-between"
				>
					<Heading color="colorPalette.fg">そふらぼ電光板</Heading>
					<HStack>
						{/* モード変更ボタン */}
						<ColorModeButton />
						{/* 設定ボタン */}
						<SettingsDialogButton
							body={
								<Field.Root>
									<Field.Label>送信先 IP アドレス</Field.Label>
									<Input
										value={ipAddress}
										onChange={(e) => {
											setIpAddress(e.target.value);
										}}
									/>
								</Field.Root>
							}
						/>
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
						disabled={sending}
					>
						<SegmentGroup.Indicator />
						<SegmentGroup.Items
							items={["1", "2", "3", "4"]}
							w="full"
							justifyContent="center"
						/>
					</SegmentGroup.Root>
				</Field.Root>

				{/* タブ */}
				<Tabs.Root
					value={tabValue}
					onValueChange={(e) => {
						setTabValue(e.value);
					}}
					colorScheme="teal"
					w="full"
					fitted
				>
					<Tabs.List>
						<Tabs.Trigger value="text" disabled={sending}>
							<MdTextFields />
							テキスト
						</Tabs.Trigger>
						<Tabs.Trigger value="image" disabled={sending}>
							<MdImage />
							イメージ
						</Tabs.Trigger>
					</Tabs.List>

					{/* テキストタブ */}
					<Tabs.Content value="text" as={VStack} spaceY="4">
						{/* フォント用カラーピッカー */}
						<ColorPickerField
							label="フォントカラー"
							value={fontColor}
							onValueChange={(e) => {
								setFontColor(e.value);
							}}
							disabled={sending}
						/>

						{/* 背景用カラーピッカー */}
						<ColorPickerField
							label={
								<>
									背景カラー
									<InfoTip content="電圧の関係上，背景色は暗くしてください" />
								</>
							}
							value={bgColor}
							onValueChange={(e) => {
								setBgColor(e.value);
							}}
							disabled={sending}
						/>

						{/* 送信テキスト入力フィールド */}
						<Field.Root disabled={sending}>
							<Field.Label>送信テキスト</Field.Label>
							<Textarea
								size="lg"
								value={text}
								onChange={(e) => {
									setText(e.target.value.trim().slice(0, maxImageCount));
								}}
								placeholder="テキストを入力"
								autoresize
								rows={1}
							/>
							<Field.HelperText alignSelf="end">
								{text.length}/20
							</Field.HelperText>
						</Field.Root>

						{/* プレビュー */}
						<Wrap w="full" justifyContent="center">
							{previewCanvasList.map((canvas, index) => (
								<Center
									// biome-ignore lint/suspicious/noArrayIndexKey: 順番が変化しないため
									key={index}
									p="8px"
									borderRadius="md"
									borderWidth="1px"
								>
									<Image
										src={canvas.toDataURL()}
										boxSize="12"
										htmlWidth="10px"
									/>
								</Center>
							))}
						</Wrap>
					</Tabs.Content>

					{/* イメージタブ */}
					<Tabs.Content value="image" as={VStack} spaceY="4">
						<FileUpload.RootProvider value={fileUpload}>
							<FileUpload.HiddenInput />
							<FileUpload.Trigger asChild>
								<Button variant="outline" w="full" disabled={sending}>
									<MdUpload /> イメージ選択 ({fileUpload.acceptedFiles.length}/
									{maxImageCount})
								</Button>
							</FileUpload.Trigger>
							<Wrap gap="2" justifyContent="center">
								{fileUpload.acceptedFiles.map((file) => (
									<FileUpload.Item
										p="8px"
										width="auto"
										key={file.name}
										file={file}
										pos="relative"
									>
										<Float>
											<FileUpload.ItemDeleteTrigger>
												<MdClose />
											</FileUpload.ItemDeleteTrigger>
										</Float>
										<FileUpload.ItemPreviewImage
											boxSize="12"
											objectFit="cover"
										/>
									</FileUpload.Item>
								))}
							</Wrap>
						</FileUpload.RootProvider>
					</Tabs.Content>
				</Tabs.Root>

				{/* 詳細設定 */}
				<Accordion.Root collapsible variant="enclosed" w="full">
					<Accordion.Item value="details">
						<Accordion.ItemTrigger>
							<Span>詳細設定</Span>
							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>
						<Accordion.ItemContent>
							<Accordion.ItemBody as={VStack} spaceY="2">
								{/* フレーム間隔指定フィールド */}
								<Field.Root disabled={sending}>
									<Field.Label>フレーム間隔 (秒)</Field.Label>
									<NumberInput.Root
										value={interval}
										onValueChange={(e) => {
											setInterval(e.value);
										}}
										min={0.2}
										max={10}
										step={0.2}
									>
										<NumberInput.Control />
										<NumberInput.Input />
									</NumberInput.Root>
								</Field.Root>

								{/* ループ回数指定フィールド */}
								<Field.Root disabled={sending}>
									<Field.Label>ループ回数</Field.Label>
									<NumberInput.Root
										value={loopCount}
										onValueChange={(e) => {
											setLoopCount(e.value);
										}}
										min={1}
										max={20}
										step={1}
									>
										<NumberInput.Control />
										<NumberInput.Input />
									</NumberInput.Root>
								</Field.Root>
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				</Accordion.Root>

				{/* 送信ボタン */}
				<Button
					onClick={handleSend}
					loading={sending || generating}
					loadingText="送信中"
					spinnerPlacement="end"
					w="96px"
					alignSelf="end"
				>
					送信
					<MdSend />
				</Button>
			</VStack>
		</>
	);
};

export default Home;
