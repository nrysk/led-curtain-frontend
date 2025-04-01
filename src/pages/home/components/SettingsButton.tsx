import { CloseButton, Dialog, IconButton, Portal } from "@chakra-ui/react";
import { MdMenu } from "react-icons/md";

interface SettingsDialogButtonProps {
	body: React.ReactNode;
}

const SettingsDialogButton = ({ body }: SettingsDialogButtonProps) => {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<IconButton
					variant="ghost"
					size="sm"
					css={{ _icon: { w: "5", h: "5" } }}
				>
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
						<Dialog.Body>{body}</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default SettingsDialogButton;
