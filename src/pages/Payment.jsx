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
      // TODO: connect to real backend
      // const res = await api.post('/pos/orders', {
      //   client_id: client.id,
      //   event_id: event.id,
      //   seat_ids: selectedSeats.map(s => s.id),
      //   payment_method: paymentMethod,
      //   channel: 'pos'
      // })
      // navigate('/pos/confirmed', { state: { order: res.data } })

      // Temporary: simulate successful purchase
      const fakeOrder = {
        id: crypto.randomUUID(),
        order_number: `POS-${Date.now()}`,
        client,
        event,
        seats: selectedSeats,
        total: getTotal(),
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        tickets: selectedSeats.map(seat => ({
          id: crypto.randomUUID(),
          seat,
          qr_code: `TICKET-${seat.id}-${Date.now()}`
        }))
      }

      navigate('/pos/confirmed', { state: { order: fakeOrder } })
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Uno o más puestos ya fueron tomados. Vuelve a seleccionar.')
      } else {
        setError('Error al procesar la compra')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-page">
      <header className="payment-header">
        <div>
          <h1>Confirmar compra</h1>
          <p>Verifica los datos antes de confirmar</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Volver
        </button>
      </header>

      <div className="payment-layout">
        <div className="payment-details">

          <div className="card detail-section">
            <h3>Cliente</h3>
            <p>{client.nombre}</p>
            <p className="detail-secondary">{client.email}</p>
          </div>

          <div className="card detail-section">
            <h3>Evento</h3>
            <p>{event.title}</p>
            <p className="detail-secondary">
              {new Date(event.start_date).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="card detail-section">
            <h3>Puestos seleccionados</h3>
            <ul className="payment-seats-list">
              {selectedSeats.map(seat => (
                <li key={seat.id}>
                  <span>Fila {seat.row} — Puesto {seat.number}</span>
                  <span className="seat-zone-badge">{seat.zone}</span>
                  <span>{formatPrice(seat.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card detail-section">
            <h3>Método de pago</h3>
            <div className="payment-methods">
              <label
                className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <span className="payment-option-title">Efectivo</span>
                  <span className="payment-option-desc">Pago en caja</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === 'card_terminal' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card_terminal"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <span className="payment-option-title">Datáfono</span>
                  <span className="payment-option-desc">Tarjeta débito o crédito</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="payment-confirm">
          <div className="card">
            <h3>Resumen de compra</h3>

            <div className="confirm-line">
              <span>Evento</span>
              <span>{event.title}</span>
            </div>

            <div className="confirm-line">
              <span>Puestos</span>
              <span>{selectedSeats.length}</span>
            </div>

            <div className="confirm-line">
              <span>Método</span>
              <span>{paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card_terminal' ? 'Datáfono' : '—'}</span>
            </div>

            <div className="confirm-total">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={confirmPurchase}
              disabled={loading || !paymentMethod}
            >
              {loading ? 'Procesando...' : `Confirmar compra — ${formatPrice(getTotal())}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment