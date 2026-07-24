import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
// Hook tùy chỉnh để dùng AuthContext dễ hơn
export function useAuth() {
  return useContext(AuthContext);
}
