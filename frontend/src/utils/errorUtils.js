export const extractApiError = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (responseData && typeof responseData === "object") {
    const firstMessage = Object.values(responseData)[0];
    if (typeof firstMessage === "string") {
      return firstMessage;
    }
  }

  return fallbackMessage;
};
