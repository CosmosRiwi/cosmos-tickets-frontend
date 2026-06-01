import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
// import api from '../services/api'; // (Mantenido comentado si usas axios directo como en tu código original)
import './Events.css';

function Eventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const client = location.state?.cliente;

  useEffect(() => {
    if (!client) {
      navigate('/pos');
      return;
    }
    loadEvents();
  }, [client, navigate]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get('/api/public/events');
      
      const activeEvents = res.data.filter(event => event.status === 'published');
      setEvents(activeEvents);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      setError('No pudimos conectar con el servidor para obtener los eventos.');
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = (event) => {
    navigate(`/pos/seats/${event.id}`, {
      state: { 
        client, 
        event 
      }
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
  
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'short', 
      day: 'numeric', 
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Vista de Carga Teatral
  if (loading) {
    return (
      <div className="events-wrapper loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Abriendo el telón... cargando cartelera</p>
      </div>
    );
  }

  return (
    <div className="events-wrapper">
      <header className="events-topbar">
        <div className="topbar-brand">
          <h1 className="brand-title-sm">Playwright</h1>
          <span className="brand-badge">Cartelera</span>
        </div>
        
        <div className="topbar-right">
          <div className="active-client-badge">
            <span className="client-label">Espectador Actual:</span>
            <span className="client-name">{client?.nombre} <small>({client?.email})</small></span>
          </div>
          <button className="btn-outline-back" onClick={() => navigate('/pos')}>
            ← Cambiar Cliente
          </button>
        </div>
      </header>

      <main className="events-main">
        <div className="events-header-title">
          <h2 className="section-title">Funciones Disponibles</h2>
          <p className="section-subtitle">Selecciona una obra para proceder a la asignación de butacas.</p>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
            <button className="btn-retry" onClick={loadEvents}>Reintentar</button>
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3>No hay funciones en cartelera</h3>
            <p>Actualmente no tenemos eventos publicados para la venta en taquilla.</p>
          </div>
        )}

        <div className="theatre-grid">
          {events.map(event => (
            <div
              key={event.id}
              className="playbill-card"
              onClick={() => selectEvent(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') selectEvent(event); }}
            >
              <div className="poster-container">
                {event.posterUrl 
                  ? <img src={event.posterUrl} alt={`Póster de ${event.name}`} loading="lazy" className="poster-image" />
                  : <div className="poster-placeholder">
                      <span>{event.name.charAt(0).toUpperCase()}</span>
                    </div>
                }
                <div className="poster-overlay">
                  <span className="event-type-badge">{event.eventTypeName}</span>
                </div>
              </div>

              <div className="playbill-info">
                <h3 className="event-title" title={event.name}>{event.name}</h3>
                
                <p className="event-description" title={event.description}>
                  {event.description || 'Sin sinopsis disponible para esta función.'}
                </p>
                
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-icon" aria-hidden="true">📍</span> 
                    <span className="detail-text">{event.roomName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon" aria-hidden="true">📅</span> 
                    <span className="detail-text capitalize-first">{formatDateTime(event.eventStartAt)}</span>
                  </div>
                </div>
                
                <div className="playbill-footer">
                  <span className="action-link">Seleccionar Butacas →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Eventos;