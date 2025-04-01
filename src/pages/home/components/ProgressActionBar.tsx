import { ActionBar, Button, HStack, Portal, Progress } from "@chakra-ui/react";

interface ProgressActionBarProps {
	open: boolean;
	value: number;
	onCancel: () => void;
}

const ProgressActionBar = ({
	open,
	value,
	onCancel,
}: ProgressActionBarProps) => {
	return (
		<ActionBar.Root open={open}>
			<Portal>
				<ActionBar.Positioner>
					<ActionBar.Content w="full" maxW="500px" mx="auto">
						<Progress.Root value={value} w="full">
							<HStack>
								<Button variant="ghost" onClick={onCancel} size="sm">
									中止
								</Button>
								<Progress.Track w="full">
									<Progress.Range />
								</Progress.Track>
								<Progress.ValueText />
							</HStack>
						</Progress.Root>
					</ActionBar.Content>
				</ActionBar.Positioner>
			</Portal>
		</ActionBar.Root>
	);
};

export default ProgressActionBar;
