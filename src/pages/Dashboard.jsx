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
  const [cliente, setCliente] = useState(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const buscarCliente = async (e) => {
    e.preventDefault()
    setError('')
    setCliente(null)
    setNoEncontrado(false)
    setLoading(true)

    try {
      const res = await api.get(`/pos/clientes?email=${email}`)
      setCliente(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setNoEncontrado(true)
      } else {
        setError('Error al buscar el cliente')
      }
    } finally {
      setLoading(false)
    }
  }

  const crearCliente = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/pos/clientes', { email })
      setCliente(res.data)
      setNoEncontrado(false)
    } catch (err) {
      setError('Error al crear la cuenta del cliente')
    } finally {
      setLoading(false)
    }
  }

  const continuarVenta = () => {
    navigate('/pos/eventos', { state: { cliente } })
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
        <p>Busca al cliente por correo electrónico para iniciar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={buscarCliente} className="search-form">
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

        {cliente && (
          <div className="card client-card">
            <h3>Cliente encontrado</h3>
            <p><strong>Nombre:</strong> {cliente.nombre}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <button className="btn btn-primary" onClick={continuarVenta}>
              Continuar con la venta
            </button>
          </div>
        )}

        {noEncontrado && (
          <div className="card client-not-found">
            <h3>Cliente no registrado</h3>
            <p>No existe una cuenta con el correo <strong>{email}</strong></p>
            <p>Se creará una cuenta automática para vincular la boleta</p>
            <button
              className="btn btn-primary"
              onClick={crearCliente}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear cuenta y continuar'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard