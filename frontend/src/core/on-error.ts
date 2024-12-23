export const onError = (error: Error, info: { componentStack: string }) => {
  console.error('On Error ==========');
  console.error(error);
  console.error(info.componentStack);
  console.error('On Error ----------');
};
