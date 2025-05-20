// import { useState } from 'react';

// interface ApiResponse<T> {
//   data: T | null;
//   loading: boolean;
//   error: string | null;
// }

// export function useApi<T>() {
//   const [response, setResponse] = useState<ApiResponse<T>>({
//     data: null,
//     loading: false,
//     error: null,
//   });

//   const execute = async (apiCall: () => Promise<T>) => {
//     setResponse({ data: null, loading: true, error: null });
//     try {
//       const data = await apiCall();
//       setResponse({ data, loading: false, error: null });
//       return data;
//     } catch (error) {
//       setResponse({ data: null, loading: false, error: 'An error occurred' });
//       throw error;
//     }
//   };

//   return { ...response, execute };
// }

import { useState } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (apiCall: () => Promise<T>) => {
    setResponse({ data: null, loading: true, error: null });
    try {
      const data = await apiCall();
      setResponse({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setResponse({ data: null, loading: false, error: 'Une erreur est survenue' });
      throw error;
    }
  };

  return { ...response, execute };
}