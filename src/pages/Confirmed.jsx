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
    if (method === 'card') return 'Datáfono'
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
      {/* ===== VISTA DE PANTALLA (No se imprime) ===== */}
      <div className="confirmed-wrapper no-print">
        <div className="confirmed-card">
          <div className="success-icon-container">
            <span className="success-icon">✓</span>
          </div>
          
          <h1 className="success-title">¡Compra Exitosa!</h1>
          <p className="confirmed-subtitle">
            Orden <strong className="order-highlight">#{order.orderNumber}</strong> procesada correctamente
          </p>

          <div className="confirmed-details-grid">
            
            <div className="confirmed-section">
              <h3 className="section-label">Cliente</h3>
              <p className="section-value">{client?.nombre}</p>
              <p className="section-subvalue">{client?.email}</p>
            </div>

            <div className="confirmed-section">
              <h3 className="section-label">Función</h3>
              <p className="section-value">{event?.name}</p>
              <p className="section-subvalue capitalize-first">{formatDate(event?.eventStartAt)}</p>
            </div>

            <div className="confirmed-section full-width">
              <h3 className="section-label">Asientos Asignados</h3>
              <ul className="confirmed-tickets-list">
                {order.tickets.map(ticket => (
                  <li key={ticket.ticketId} className="confirmed-ticket-item">
                    <div className="ticket-item-left">
                      <span className="ticket-loc">Fila {ticket.seatRow} — Puesto {ticket.seatNumber}</span>
                      <span className={`ticket-zone-badge ${ticket.zoneName === 'VIP' ? 'is-vip' : ''}`}>
                        {ticket.zoneName}
                      </span>
                    </div>
                    <span className="ticket-price">{formatPrice(ticket.pricePaid)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="confirmed-section">
              <h3 className="section-label">Método de Pago</h3>
              <p className="section-value">{paymentLabel(order.paymentMethod)}</p>
            </div>

            <div className="confirmed-section total-section">
              <span className="total-label">Total Pagado</span>
              <span className="total-value">{formatPrice(order.total)}</span>
            </div>

          </div>

          <div className="confirmed-actions">
            <button className="btn-action-secondary" onClick={printTicket}>
              🖨️ Imprimir Boletas
            </button>
            <button className="btn-action-primary" onClick={newSale}>
              Iniciar Nueva Venta →
            </button>
          </div>

          <p className="confirmed-note">
            El cliente recibirá su confirmación digital y códigos de acceso por correo electrónico.
          </p>
        </div>
      </div>

      {/* ===== VISTA DE IMPRESIÓN (Visible solo en Impresora Térmica) ===== */}
      <div className="ticket-print-layout">
        <div className="print-header">
          <h2 className="print-brand">Playwright</h2>
          <p className="print-subtitle">Taquilla Oficial</p>
          <p className="print-order">ORDEN #{order.orderNumber}</p>
        </div>

        <div className="print-divider"></div>

        <div className="print-event-info">
          <h3 className="print-event-name">{event?.name}</h3>
          <p className="print-event-date">{formatDate(event?.eventStartAt)}</p>
          <p className="print-client">Cliente: {client?.nombre}</p>
        </div>

        <div className="print-divider"></div>

        <div className="print-tickets-container">
          {order.tickets.map(ticket => (
            <div key={ticket.ticketId} className="print-single-ticket">
              <div className="print-qr-code">
                {ticket.qrToken ? (
                  <QRCodeSVG value={ticket.qrToken} size={160} level="M" />
                ) : (
                  <p className="no-qr">QR no disponible</p>
                )}
              </div>
              <div className="print-seat-details">
                <p className="print-seat-loc">FILA {ticket.seatRow} - PUESTO {ticket.seatNumber}</p>
                <p className="print-seat-zone">{ticket.zoneName}</p>
                <p className="print-seat-price">{formatPrice(ticket.pricePaid)}</p>
              </div>
              <div className="print-divider-dotted"></div>
            </div>
          ))}
        </div>

        <div className="print-totals">
          <div className="print-total-line">
            <span>Método:</span>
            <span>{paymentLabel(order.paymentMethod)}</span>
          </div>
          <div className="print-total-line print-total-big">
            <span>TOTAL PAGADO:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="print-divider"></div>

        <div className="print-footer">
          <p>Conserve este recibo.</p>
          <p>Presente cada código QR para el ingreso al teatro.</p>
          <p className="print-thanks">¡Disfrute la función!</p>
        </div>
      </div>
    </>
  )
}

export default Confirmed