import { ColorModeButton } from "@/components/ui/color-mode";
import { Toaster, toaster } from "@/components/ui/toaster";
import { InfoTip } from "@/components/ui/toggle-tip";
import { canvasToBlob, textToCanvas } from "@/utils";
import {
	Button,
	Card,
	Center,
	Field,
	HStack,
	Heading,
	Image,
	Input,
	NumberInput,
	SegmentGroup,
	Textarea,
	VStack,
	Wrap,
	parseColor,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdSend } from "react-icons/md";
import ColorPickerField from "./ColorPickerField";
import ProgressActionBar from "./ProgressActionBar";
import SettingsDialogButton from "./SettingsButton";
import useIpAddress from "./useIpAddress";

const imageSize = 20;
const maxTextLength = 20;

const Home = () => {
	// 処理の状態
	const [sending, setSending] = useState(false);
	const [sendedCount, setSendedCount] = useState(0);
	const [generating, setGenerating] = useState(false);
	// 入力の状態
	const [ipAddress, setIpAddress] = useIpAddress();
	const [presetId, setPresetId] = useState<string | null>("1");
	const [fontColor, setFontColor] = useState(parseColor("#f00"));
	const [bgColor, setBgColor] = useState(parseColor("#000"));
	const [interval, setInterval] = useState("1");
	const [loopCount, setLoopCount] = useState("1");
	const [text, setText] = useState("");
	// 出力の状態
	const [canvasList, setCanvasList] = useState<HTMLCanvasElement[]>([]);

	// テキスト変更時にキャンバスを生成
	useEffect(() => {
		setGenerating(true);
		const newCanvasList = text.split("").map((char) => {
			return textToCanvas(char, fontColor, bgColor, imageSize, imageSize);
		});
		setCanvasList(newCanvasList);
		setGenerating(false);
	}, [text, fontColor, bgColor]);

	// キャンバスを Blob に変換・送信
	const handleSend = async () => {
		// 例外処理
		if (generating) {
			return;
		}
		if (!text) {
			toaster.warning({
				title: "テキストを入力してください",
			});
			return;
		}

		setSending(true);
		setSendedCount(0);
		// canvas 一つずつを Blob に変換して送信
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
			await fetch(`http://${ipAddress}/presets/${presetId}/frames`, {
				method: "POST",
				body: formData,
			}).then(() => {
				// 送信完了カウントを増やす
				setSendedCount((prev) => prev + 1);
			});

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
				totalFrames: canvasList.length,
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
				value={Math.floor((sendedCount / canvasList.length) * 100)}
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

				{/* 送信テキスト入力フィールド */}
				<Field.Root disabled={sending}>
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

				{/* 生成したキャンバス */}

				<Card.Root w="full">
					<Card.Header>
						<Card.Title>送信イメージ</Card.Title>
					</Card.Header>
					<Card.Body>
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
					</Card.Body>
				</Card.Root>
			</VStack>
		</>
	);
};

export default Home;
