import { Provider } from "@/components/ui/provider.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("No root element");
createRoot(root).render(
	<StrictMode>
		<Provider>
			<Router basename={import.meta.env.BASE_URL}>
				<Routes>
					<Route path="/" element={<App />} />
				</Routes>
			</Router>
		</Provider>
	</StrictMode>,
);
