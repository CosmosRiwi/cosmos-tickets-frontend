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

  if (loading) return <div className="loading">Cargando puestos...</div>
  if (error) return <div className="error-message">{error}</div>


  const rows = [...new Set(seats.map(s => s.rowLabel))]

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

      <div className="seats-layout">
        <div className="seats-map">
          <div className="stage">ESCENARIO</div>

          <div className="seats-grid">
            {rows.map(row => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
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
         
                  <li key={seat.seatId}>
             
                    <span>Fila {seat.rowLabel} — Puesto {seat.seatNumber}</span>
         
                    <span className="seat-zone-badge">{seat.zoneName}</span>
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
