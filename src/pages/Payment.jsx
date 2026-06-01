import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Payment.css'

function Payment() {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const client = location.state?.client
  const event = location.state?.event
  const selectedSeats = location.state?.selectedSeats

  if (!client || !event || !selectedSeats) {
    navigate('/pos')
    return null
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

  const confirmPurchase = async () => {
    if (!paymentMethod) {
      setError('Selecciona un método de pago')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Un solo paso: crear = pagar. La orden nace pagada con tickets valid + QR.
      const res = await api.post('/orders', {
        customerId: client.id,
        eventId: event.id,
        seatIds: selectedSeats.map(s => s.seatId),
        paymentMethod,
      })

      navigate('/pos/confirmed', {
        state: { order: res.data, client, event },
      })
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Uno o más puestos ya fueron tomados. Vuelve a seleccionar.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Error al procesar la compra')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-wrapper">
      <header className="payment-topbar">
        <div className="topbar-left">
          <h1 className="event-title-display">Checkout de Taquilla</h1>
          <p className="client-context">
            Verificación final para la orden de <strong>{client?.nombre}</strong>
          </p>
        </div>
        <button className="btn-outline-back" onClick={() => navigate(-1)} disabled={loading}>
          ← Volver al Mapa
        </button>
      </header>

      <div className="payment-layout">
        
        {/* Columna Izquierda: Detalles del Expediente */}
        <div className="payment-dossier">
          
          <div className="dossier-card">
            <h3 className="dossier-title">1. Datos del Cliente</h3>
            <div className="dossier-content">
              <p className="primary-text">{client.nombre}</p>
              <p className="secondary-text">{client.email}</p>
            </div>
          </div>

          <div className="dossier-card">
            <h3 className="dossier-title">2. Función</h3>
            <div className="dossier-content">
              <p className="primary-text">{event.name}</p>
              <p className="secondary-text capitalize-first">
                {new Date(event.eventStartAt).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="dossier-card">
            <h3 className="dossier-title">3. Asientos Asignados ({selectedSeats.length})</h3>
            <ul className="payment-seats-list">
              {selectedSeats.map(seat => (
                <li key={seat.seatId} className="payment-seat-item">
                  <div className="seat-item-info">
                    <span className="seat-item-loc">Fila {seat.rowLabel} — Puesto {seat.seatNumber}</span>
                    <span className={`seat-item-zone ${seat.zoneName === 'VIP' ? 'is-vip' : ''}`}>
                      {seat.zoneName}
                    </span>
                  </div>
                  <span className="seat-item-price">{formatPrice(seat.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dossier-card highlight-card">
            <h3 className="dossier-title">4. Método de Pago</h3>
            <div className="payment-methods-grid">
              
              <label className={`payment-tile ${paymentMethod === 'cash' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden-radio"
                />
                <div className="tile-content">
                  <span className="tile-icon">💵</span>
                  <div className="tile-text">
                    <span className="tile-title">Efectivo</span>
                    <span className="tile-desc">Pago en caja física</span>
                  </div>
                </div>
                <div className="radio-indicator"></div>
              </label>

              <label className={`payment-tile ${paymentMethod === 'card' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden-radio"
                />
                <div className="tile-content">
                  <span className="tile-icon">💳</span>
                  <div className="tile-text">
                    <span className="tile-title">Datáfono</span>
                    <span className="tile-desc">Tarjeta débito/crédito</span>
                  </div>
                </div>
                <div className="radio-indicator"></div>
              </label>

            </div>
          </div>

        </div>

        {/* Columna Derecha: El "Ticket" / Factura de Cobro */}
        <div className="payment-receipt-aside">
          <div className="receipt-card">
            
            <div className="receipt-header">
              <h3>Resumen de la Transacción</h3>
              <span className="receipt-badge">Borrador</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-line">
                <span className="line-label">Función</span>
                <span className="line-value text-right ellipsis">{event.name}</span>
              </div>
              <div className="receipt-line">
                <span className="line-label">Cantidad</span>
                <span className="line-value">{selectedSeats.length} Ticket(s)</span>
              </div>
              <div className="receipt-line">
                <span className="line-label">Método</span>
                <span className="line-value highlight-value">
                  {paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Datáfono' : 'Pendiente'}
                </span>
              </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="receipt-footer">
              <div className="receipt-total">
                <span>Total Final</span>
                <span className="total-amount">{formatPrice(getTotal())}</span>
              </div>

              {error && (
                <div className="checkout-error">
                  <span className="error-icon">⚠</span> {error}
                </div>
              )}

              <button
                className="btn-action-primary btn-full btn-lg"
                onClick={confirmPurchase}
                disabled={loading || !paymentMethod}
              >
                {loading ? (
                  <span className="btn-loading-state">
                    <span className="spinner-small"></span> Procesando Transacción...
                  </span>
                ) : (
                  `Emitir Tickets — ${formatPrice(getTotal())}`
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Payment