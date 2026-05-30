let requestCount = 0;

export const startLoading = () => {
  requestCount++;
  document.dispatchEvent(new Event("show-loader"));
};

export const stopLoading = () => {
  requestCount--;

  if (requestCount <= 0) {
    requestCount = 0;
    document.dispatchEvent(new Event("hide-loader"));
  }
};