import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import api from '../services/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

  try {
const res = await api.post('/auth/login', { email, password })

login(res.data.token, {
  id: res.data.userId,
  nombre: res.data.fullName,
  userType: res.data.userType,
})

navigate('/pos')
  } catch (err) {
    if (err.response?.status === 401) {
      setError('Credenciales incorrectas o sin acceso')
    } else {
      setError('Error de conexión con el servidor')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="login-container">
      <h1>POS Cosmos Tickets</h1>
      <p>Inicia sesión para acceder a la taquilla</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="empleado@cosmos.com"
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

export default Login