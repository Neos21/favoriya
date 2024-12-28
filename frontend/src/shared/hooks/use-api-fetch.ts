import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../stores/store';

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

/** Post FormData */
export const useApiPostFormData = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiPostFormData = useCallback(async (apiPath: string, formData: FormData): Promise<Response> => {
    return fetch(`/api${apiPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
  }, [token]);
  return apiPostFormData;
};

/** Put */
export const useApiPut = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiPut = useCallback(async (apiPath: string, requestBody: unknown): Promise<Response> => {
    return fetch(`/api${apiPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
  }, [token]);
  return apiPut;
};

/** Patch */
export const useApiPatch = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiPatch = useCallback(async (apiPath: string, requestBody: unknown): Promise<Response> => {
    return fetch(`/api${apiPath}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
  }, [token]);
  return apiPatch;
};

/** Delete */
export const useApiDelete = () => {
  const userState = useSelector((state: RootState) => state.user);
  const token = userState.token;
  const apiDelete = useCallback(async (apiPath: string, queryString: string = ''): Promise<Response> => {
    return fetch(`/api${apiPath}${queryString}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  }, [token]);
  return apiDelete;
};
