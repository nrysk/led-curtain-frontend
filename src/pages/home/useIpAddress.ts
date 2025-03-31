import { useSearchParams } from "react-router";

function useIpAddress() {
	const [searchParams, setSearchParams] = useSearchParams();
	const ipAddress = searchParams.get("esp-ip") || "";
	const setIpAddress = (value: string) => {
		if (value) {
			setSearchParams({ "esp-ip": value });
		} else {
			setSearchParams({});
		}
	};
	return [ipAddress, setIpAddress] as const;
}

export default useIpAddress;
