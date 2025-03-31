import { ActionBar, HStack, Portal, Progress } from "@chakra-ui/react";

interface ProgressActionBarProps {
	open: boolean;
	value: number;
}

const ProgressActionBar = ({ open, value }: ProgressActionBarProps) => {
	return (
		<ActionBar.Root open={open}>
			<Portal>
				<ActionBar.Positioner>
					<ActionBar.Content w="full" maxW="500px" mx="auto" p="4">
						<Progress.Root value={value} w="full">
							<HStack>
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
