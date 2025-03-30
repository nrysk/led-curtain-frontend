import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
	globalCss: {
		html: {
			colorPalette: "blue",
		},
	},
});

const system = createSystem(defaultConfig, config);

export default system;
