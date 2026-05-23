import { useNavigate, useLocation } from 'react-router-dom'
import './Confirmed.css'

function Confirmed() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    navigate('/pos')
    return null
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const printTicket = () => {
    // TODO: connect to real backend
    // window.open(`/api/pos/orders/${order.id}/pdf`, '_blank')

    // Temporary: open print dialog
    window.print()
  }

  const newSale = () => {
    navigate('/pos')
  }

  return (
    <div className="confirmed-page">
      <div className="confirmed-card">
        <div className="confirmed-icon">✓</div>
        <h1>¡Compra exitosa!</h1>
        <p className="confirmed-subtitle">
          Orden <strong>{order.order_number}</strong> procesada correctamente
        </p>

        <div className="confirmed-details">
          <div className="confirmed-section">
            <h3>Cliente</h3>
            <p>{order.client.nombre}</p>
            <p className="text-secondary">{order.client.email}</p>
          </div>

          <div className="confirmed-section">
            <h3>Evento</h3>
            <p>{order.event.title}</p>
            <p className="text-secondary">{formatDate(order.event.start_date)}</p>
          </div>

          <div className="confirmed-section">
            <h3>Boletas</h3>
            <ul className="confirmed-tickets">
              {order.tickets.map(ticket => (
                <li key={ticket.id}>
                  <span>Fila {ticket.seat.row} — Puesto {ticket.seat.number}</span>
                  <span className="seat-zone-badge">{ticket.seat.zone}</span>
                  <span>{formatPrice(ticket.seat.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="confirmed-section">
            <h3>Pago</h3>
            <p>{order.payment_method === 'cash' ? 'Efectivo' : 'Datáfono'}</p>
          </div>

          <div className="confirmed-total">
            <span>Total pagado</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="confirmed-actions">
          <button className="btn btn-outline" onClick={printTicket}>
            Imprimir boleta
          </button>
          <button className="btn btn-primary" onClick={newSale}>
            Nueva venta
          </button>
        </div>

        <p className="confirmed-note">
          El cliente recibirá su boleta digital por correo electrónico
        </p>
      </div>
    </div>
  )
}

export default Confirmed