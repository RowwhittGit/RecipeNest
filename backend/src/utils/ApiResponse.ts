// Every success response will have this exact shape:
// { success: true, message: "...", data: {...} }
// Keeps your frontend parsing consistent across all endpoints

export const ApiResponse = <T>(
  data: T,
  message: string = 'Success'
) => ({
  success: true,
  message,
  data,
});