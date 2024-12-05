import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../stores/store';

/** Get */
export const useApiGet = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiGet = useCallback(async (apiPath: string, queryString: string = ''): Promise<Response> => {
    return fetch(`/api${apiPath}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  }, [token]);
  return apiGet;
};

/** Post */
export const useApiPost = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiPost = useCallback(async (apiPath: string, requestBody: unknown): Promise<Response> => {
    return fetch(`/api${apiPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
  }, [token]);
  return apiPost;
};
