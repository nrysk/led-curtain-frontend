import Home from "@/pages/home";
import { Route, BrowserRouter as Router, Routes } from "react-router";

function App() {
	return (
		<Router basename={import.meta.env.BASE_URL}>
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</Router>
	);
}

export default App;
