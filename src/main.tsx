import { Provider } from "@/components/ui/provider.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("No root element");
createRoot(root).render(
	<StrictMode>
		<Provider>
			<App />
		</Provider>
	</StrictMode>,
);
