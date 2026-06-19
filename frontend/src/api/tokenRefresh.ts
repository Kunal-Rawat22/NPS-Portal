import axios from 'axios';
import { unwrapApiData } from '../types/api';
import { AuthResponse } from '../types';

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const res = await axios.post('/api/auth/refresh', { refreshToken });
  return unwrapApiData<AuthResponse>(res.data);
}
