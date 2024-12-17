/** トークンなし GET */
export const apiGetWithoutToken = (apiPath: string, queryString: string = ''): Promise<Response> => {
  return fetch(`/api${apiPath}${queryString}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
};

/** トークンなし POST */
export const apiPostWithoutToken = (apiPath: string, requestBody: unknown): Promise<Response> => {
  return fetch(`/api${apiPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
};
