import { useNavigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import './Confirmed.css'

function Confirmed() {
  const navigate = useNavigate()
  const location = useLocation()

  const order = location.state?.order
  const client = location.state?.client
  const event = location.state?.event

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
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const paymentLabel = (method) => {
    if (method === 'cash') return 'Efectivo'
    if (method === 'card') return 'Tarjeta'
    return method || '—'
  }

  const printTicket = () => {
    window.print()
  }

  const newSale = () => {
    navigate('/pos')
  }

  return (
    <>
      {/* pantana*/}
      <div className="confirmed-page no-print">
        <div className="confirmed-card">
          <div className="confirmed-icon">✓</div>
          <h1>¡Compra exitosa!</h1>
          <p className="confirmed-subtitle">
            Orden <strong>{order.orderNumber}</strong> procesada correctamente
          </p>

          <div className="confirmed-details">
            <div className="confirmed-section">
              <h3>Cliente</h3>
              <p>{client?.nombre}</p>
              <p className="text-secondary">{client?.email}</p>
            </div>

            <div className="confirmed-section">
              <h3>Evento</h3>
              <p>{event?.name}</p>
              <p className="text-secondary">{formatDate(event?.eventStartAt)}</p>
            </div>

            <div className="confirmed-section">
              <h3>Boletas</h3>
              <ul className="confirmed-tickets">
                {order.tickets.map(ticket => (
                  <li key={ticket.ticketId}>
                    <span>Fila {ticket.seatRow} — Puesto {ticket.seatNumber}</span>
                    <span className="seat-zone-badge">{ticket.zoneName}</span>
                    <span>{formatPrice(ticket.pricePaid)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="confirmed-section">
              <h3>Pago</h3>
              <p>{paymentLabel(order.paymentMethod)}</p>
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


        
      {/* impersion de la boleta */}
      <div className="ticket-print">
        <div className="ticket-header">
          <h2>PlayWright</h2>
          <p className="ticket-order">Orden {order.orderNumber}</p>
        </div>

        <div className="ticket-divider"></div>

        <div className="ticket-event">
          <p className="ticket-event-name">{event?.name}</p>
          <p className="ticket-event-date">{formatDate(event?.eventStartAt)}</p>
        </div>

        <div className="ticket-divider"></div>

        <div className="ticket-seats">
          {order.tickets.map(ticket => (
            <div key={ticket.ticketId} className="ticket-seat-block">
              {ticket.qrToken
                ? <QRCodeSVG value={ticket.qrToken} size={130} level="M" />
                : <p>QR no disponible</p>}
              <p className="ticket-seat-label">
                Fila {ticket.seatRow} — Puesto {ticket.seatNumber}
              </p>
              <p className="ticket-seat-zone">
                {ticket.zoneName} — {formatPrice(ticket.pricePaid)}
              </p>
              <div className="ticket-divider-dotted"></div>
            </div>
          ))}
        </div>

        <div className="ticket-totals">
          <div className="ticket-total-line">
            <span>Método de pago</span>
            <span>{paymentLabel(order.paymentMethod)}</span>
          </div>
          <div className="ticket-total-line ticket-total-big">
            <span>TOTAL</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="ticket-divider"></div>

          <p className="ticket-footer">
            Conserve esta boleta - Presente cada QR en el ingreso
          </p>
      </div>
    </>
  )
}

export default Confirmed