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
      // TODO: connect to real backend
      // const res = await api.get(`/pos/events/${event.id}/seats`)
      // setSeats(res.data)

      // Temporary data for development
      const rows = ['A', 'B', 'C', 'D', 'E', 'F']
      const seatsPerRow = 10
      const tempSeats = []

      rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
          tempSeats.push({
            id: `${row}${i}`,
            row: row,
            number: i.toString(),
            zone: row <= 'B' ? 'VIP' : 'General',
            price: row <= 'B' ? event.base_price * 1.5 : event.base_price,
            status: Math.random() > 0.3 ? 'available' : 'occupied'
          })
        }
      })

      setSeats(tempSeats)
    } catch (err) {
      setError('Error al cargar los puestos')
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = (seat) => {
    if (seat.status === 'occupied') return

    const isSelected = selectedSeats.find(s => s.id === seat.id)

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const getSeatClass = (seat) => {
    if (seat.status === 'occupied') return 'seat occupied'
    if (selectedSeats.find(s => s.id === seat.id)) return 'seat selected'
    if (seat.zone === 'VIP') return 'seat available vip'
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

  if (loading) return <div className="loading">Cargando puestos...</div>

  // Group seats by row
  const rows = [...new Set(seats.map(s => s.row))]

  return (
    <div className="seats-page">
      <header className="seats-header">
        <div>
          <h1>{event.title}</h1>
          <p>Cliente: <strong>{client?.nombre}</strong> — Selecciona los puestos</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Volver
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="seats-layout">
        <div className="seats-map">
          <div className="stage">ESCENARIO</div>

          <div className="seats-grid">
            {rows.map(row => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {seats
                  .filter(s => s.row === row)
                  .map(seat => (
                    <div
                      key={seat.id}
                      className={getSeatClass(seat)}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.row}${seat.number} — ${seat.zone} — ${formatPrice(seat.price)}`}
                    >
                      {seat.number}
                    </div>
                  ))
                }
                <span className="row-label">{row}</span>
              </div>
            ))}
          </div>

          <div className="seats-legend">
            <div className="legend-item">
              <div className="seat-sample available"></div>
              <span>Disponible</span>
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

        <div className="seats-summary">
          <h3>Resumen de selección</h3>

          {selectedSeats.length === 0 ? (
            <p className="empty-selection">No has seleccionado puestos</p>
          ) : (
            <>
              <ul className="selected-list">
                {selectedSeats.map(seat => (
                  <li key={seat.id}>
                    <span>Fila {seat.row} — Puesto {seat.number}</span>
                    <span className="seat-zone-badge">{seat.zone}</span>
                    <span>{formatPrice(seat.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={continueToPayment}
              >
                Continuar al pago
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Seats