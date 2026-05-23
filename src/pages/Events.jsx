import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Events.css'

function Eventos() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const client = location.state?.cliente

  useEffect(() => {
    if (!client) {
      navigate('/pos')
      return
    }

    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      // TODO: connect to real backend
      // const res = await api.get('/pos/eventos')
      // setEvents(res.data)

      // Temporary data for development
      setEvents([
        {
          id: '1',
          title: 'Romeo y Julieta',
          description: 'Obra clásica de Shakespeare',
          start_date: '2026-06-15T20:00:00',
          base_price: 45000,
          poster_url: null,
          available_seats: 120
        },
        {
          id: '2',
          title: 'El Lago de los Cisnes',
          description: 'Ballet clásico de Tchaikovsky',
          start_date: '2026-06-22T19:00:00',
          base_price: 60000,
          poster_url: null,
          available_seats: 85
        },
        {
          id: '3',
          title: 'Stand Up Comedy Night',
          description: 'Noche de comedia con artistas locales',
          start_date: '2026-06-28T21:00:00',
          base_price: 30000,
          poster_url: null,
          available_seats: 0
        }
      ])
    } catch (err) {
      setError('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  const selectEvent = (event) => {
    if (event.available_seats === 0) return

    navigate(`/pos/seats/${event.id}`, {
      state: { client, event }
    })
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) return <div className="loading">Cargando eventos...</div>

  return (
    <div className="events-page">
      <header className="events-header">
        <div>
          <h1>Seleccionar evento</h1>
          <p>Cliente: <strong>{client?.nombre}</strong> — {client?.email}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/pos')}>
          Volver
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="events-grid">
        {events.map(event => (
          <div
            key={event.id}
            className={`card event-card ${event.available_seats === 0 ? 'sold-out' : ''}`}
            onClick={() => selectEvent(event)}
          >
            <div className="event-poster">
              {event.poster_url
                ? <img src={event.poster_url} alt={event.title} />
                : <div className="poster-placeholder">{event.title[0]}</div>
              }
            </div>

            <div className="event-info">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <p className="event-date">{formatDate(event.start_date)}</p>
              <div className="event-footer">
                <span className="event-price">{formatPrice(event.base_price)}</span>
                <span className={`badge ${event.available_seats > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {event.available_seats > 0
                    ? `${event.available_seats} disponibles`
                    : 'Agotado'
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Eventos