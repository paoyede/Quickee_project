export const Message = (
  code?: number,
  message?: string,
  body?: any,
  extrainfo?: any
) => {
  return { code: code, message: message, body: body, extrainfo: extrainfo };
};
