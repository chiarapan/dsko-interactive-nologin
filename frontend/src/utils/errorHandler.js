export function handleApiError(error, enqueueSnackbar, overrides = {}) {
  const {
    network = "Network error – check your connection.",
    unknown = "An unexpected error occurred.",
    statusMessages = {}, 
  } = overrides;

  const status = error?.response?.status;
  const backendMsg = error?.response?.data?.message;

  if (status && statusMessages[status]) {
    enqueueSnackbar(statusMessages[status], { variant: "error" });
  } else if (backendMsg) {
    enqueueSnackbar(backendMsg, { variant: "error" });
  } else if (
    error?.message?.includes("NetworkError") ||
    error?.message?.includes("Failed to fetch") ||
    error?.name === "TypeError"
  ) {
    enqueueSnackbar(network, { variant: "error" });
  } else {
    enqueueSnackbar(unknown, { variant: "error" });
  }
}
