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
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-brand">
          <h1 className="brand-title-sm">Playwright</h1>
          <span className="brand-badge">Taquilla Oficial</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-role">Operador:</span>
            <span className="user-name">{empleado?.nombre || 'Empleado'}</span>
          </div>
          <button className="btn-outline-logout" onClick={handleLogout}>
            Salir del Sistema
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="workspace-container">
          <div className="workspace-header">
            <h2 className="section-title">Nueva Venta</h2>
            <p className="section-subtitle">Ingresa el correo electrónico del cliente para iniciar la orden.</p>
          </div>

          {error && (
            <div className="dashboard-error-message">
              <span className="error-icon">⚠</span> {error}
            </div>
          )}

          <form onSubmit={searchClient} className="search-form-group">
            <div className="input-search-wrapper">
              <input
                type="email"
                className="search-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                required
              />
            </div>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar Cliente'}
            </button>
          </form>

          {client && (
            <div className={`client-result-card ${client.isNew ? 'is-new-account' : 'is-found-account'}`}>
              <div className="card-status-header">
                <span className="status-indicator"></span>
                <h3>{client.isNew ? 'Cuenta creada automáticamente' : 'Espectador Encontrado'}</h3>
              </div>
              
              <div className="client-details">
                <div className="detail-row">
                  <span className="detail-label">Nombre Completo</span>
                  <span className="detail-value">{client.nombre}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Correo Electrónico</span>
                  <span className="detail-value mail-highlight">{client.email}</span>
                </div>
              </div>

              {client.isNew && (
                <div className="new-account-alert">
                  <span className="alert-icon">✉</span>
                  <p className="new-account-note">
                    Se ha generado un registro nuevo en el sistema. El cliente recibirá un correo de cortesía para activar su acceso digital.
                  </p>
                </div>
              )}

              <button className="btn-action-primary" onClick={continueToEvents}>
                Continuar a Selección de Eventos →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard