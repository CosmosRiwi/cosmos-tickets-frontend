import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  const empleado = useAuthStore((state) => state.empleado)

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!empleado?.permisos?.includes('tickets')) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute