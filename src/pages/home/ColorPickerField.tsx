import {
	type Color,
	ColorPicker,
	ColorPickerChannelSlider,
} from "@chakra-ui/react";
import type { ValueChangeDetails } from "@zag-js/color-picker";
import type { ReactNode } from "react";

interface ColorPickerFieldProps {
	label: ReactNode;
	value: Color;
	onValueChange: (value: ValueChangeDetails) => void;
	disabled?: boolean;
}

const ColorPickerField = ({
	label,
	value,
	onValueChange,
	disabled = false,
}: ColorPickerFieldProps) => {
	return (
		<ColorPicker.Root
			value={value}
			onValueChange={onValueChange}
			w="full"
			disabled={disabled}
		>
			<ColorPicker.HiddenInput />
			<ColorPicker.Label>{label}</ColorPicker.Label>
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
	);
};

export default ColorPickerField;
