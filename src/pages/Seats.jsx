import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Seats.css'

function Seats() {
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const client = location.state?.client
  const event = location.state?.event

  useEffect(() => {
    if (!client || !event) {
      navigate('/pos')
      return
    }
    loadSeats()
  }, [])

  const loadSeats = async () => {
    try {
      const res = await api.get(`/events/${event.id}/seats`)
      setSeats(res.data)
    } catch (err) {
      setError('Error al cargar los puestos')
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = (seat) => {
    if (!seat.isAvailable) return

    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId)

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const getSeatClass = (seat) => {
    if (!seat.isAvailable) return 'seat occupied'
    if (selectedSeats.find(s => s.seatId === seat.seatId)) return 'seat selected'
    if (seat.zoneName === 'VIP') return 'seat available vip'
    return 'seat available'
  }

  const getTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const continueToPayment = () => {
    navigate('/pos/payment', {
      state: { client, event, selectedSeats }
    })
  }

  // Vista Teatral de Carga / Error
  if (loading) {
    return (
      <div className="seats-wrapper loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Preparando el auditorio...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="seats-wrapper loading-container">
        <div className="error-message">
          <span className="error-icon">⚠</span> {error}
        </div>
        <button className="btn-outline-back" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  const rows = [...new Set(seats.map(s => s.rowLabel))]

  return (
    <div className="seats-wrapper">
      {/* Topbar / Cabecera */}
      <header className="seats-topbar">
        <div className="topbar-left">
          <h1 className="event-title-display">{event.name}</h1>
          <p className="client-context">
            Espectador: <strong>{client?.nombre}</strong> <span className="separator">|</span> Asignación de Asientos
          </p>
        </div>
        <button className="btn-outline-back" onClick={() => navigate(-1)}>
          ← Volver a Cartelera
        </button>
      </header>

      {/* Contenedor Principal */}
      <div className="seats-layout">
        
        {/* Mapa del Teatro */}
        <div className="seats-map-section">
          <div className="stage-area">
            <div className="stage-light"></div>
            <div className="stage-text">Escenario</div>
          </div>

          <div className="seats-grid">
            {rows.map(row => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                <div className="row-seats">
                  {seats
                    .filter(s => s.rowLabel === row)
                    .map(seat => (
                      <div
                        key={seat.seatId}
                        className={getSeatClass(seat)}
                        onClick={() => toggleSeat(seat)}
                        title={`${seat.rowLabel}${seat.seatNumber} — ${seat.zoneName} — ${formatPrice(seat.price)}`}
                      >
                        {seat.seatNumber}
                      </div>
                    ))
                  }
                </div>
                <span className="row-label">{row}</span>
              </div>
            ))}
          </div>

          <div className="seats-legend">
            <div className="legend-item">
              <div className="seat-sample available"></div>
              <span>General</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample available vip"></div>
              <span>VIP</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample selected"></div>
              <span>Seleccionado</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample occupied"></div>
              <span>Ocupado</span>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Resumen del Pedido */}
        <aside className="seats-summary-aside">
          <div className="order-summary-card">
            <h3 className="summary-title">Resumen de Orden</h3>

            {selectedSeats.length === 0 ? (
              <div className="empty-selection">
                <span className="empty-icon">🎟️</span>
                <p>Aún no has seleccionado ningun asiento para este cliente</p>
              </div>
            ) : (
              <>
                <div className="selected-list-container">
                  <ul className="selected-list">
                    {selectedSeats.map(seat => (
                      <li key={seat.seatId} className="ticket-item">
                        <div className="ticket-info">
                          <span className="ticket-seat">Fila {seat.rowLabel} — Puesto {seat.seatNumber}</span>
                          <span className={`ticket-zone ${seat.zoneName === 'VIP' ? 'is-vip' : ''}`}>
                            {seat.zoneName}
                          </span>
                        </div>
                        <span className="ticket-price">{formatPrice(seat.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="summary-total-section">
                  <div className="summary-total">
                    <span>Total a Pagar</span>
                    <span className="total-amount">{formatPrice(getTotal())}</span>
                  </div>

                  <button
                    className="btn-action-primary btn-full"
                    onClick={continueToPayment}
                  >
                    Proceder al Pago →
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}

export default Seats