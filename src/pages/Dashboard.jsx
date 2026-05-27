import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import api from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const empleado = useAuthStore((state) => state.empleado)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const searchClient = async (e) => {
    e.preventDefault()
    setError('')
    setClient(null)
    setLoading(true)

    try {
      const res = await api.post('/customers/lookup', { email })
      setClient({
        id: res.data.id,
        nombre: res.data.fullName,
        email: res.data.email,
        isNew: res.data.isNewAccount
      })
    } catch (err) {
      setError('Error al buscar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const continueToEvents = () => {
    navigate('/pos/eventos', { state: { cliente: client } })
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>POS Cosmos Tickets</h1>
        <div className="header-right">
          <span>{empleado?.nombre || 'Empleado'}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <h2>Nueva venta</h2>
        <p>Ingresa el correo del cliente para iniciar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={searchClient} className="search-form">
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {client && (
          <div className="card client-card">
            <h3>{client.isNew ? 'Cuenta creada automáticamente' : 'Cliente encontrado'}</h3>
            <p><strong>Nombre:</strong> {client.nombre}</p>
            <p><strong>Email:</strong> {client.email}</p>
            {client.isNew && (
              <p className="new-account-note">
                Se creó una cuenta nueva. El cliente recibirá un correo para activarla.
              </p>
            )}
            <button className="btn btn-primary" onClick={continueToEvents}>
              Continuar con la venta
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard