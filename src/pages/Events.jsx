import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Events.css';

function Eventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const client = location.state?.cliente;

  useEffect(() => {
    // Protección de ruta: Si un empleado entra aquí directo sin buscar cliente, lo devolvemos
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
      // Usamos la URL absoluta temporalmente para evitar el conflicto con el baseURL de Axios
      // En el futuro, lo ideal es mover esto a una variable de entorno en Vite (.env)
      const res = await api.get('http://localhost:5178/api/public/events');
      
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
    // Pasamos el cliente original Y el evento seleccionado a la vista de Sillas
    navigate(`/pos/seats/${event.id}`, {
      state: { 
        cliente: client, 
        evento: event 
      }
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    // Usamos Intl.DateTimeFormat para un formato robusto y estandarizado
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'short', 
      day: 'numeric', 
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Vista de Carga
  if (loading) {
    return (
      <div className="events-page loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando cartelera de eventos...</p>
      </div>
    );
  }

  return (
    <div className="events-page">
      <header className="events-header">
        <div className="header-info">
          <h1>Seleccionar Evento</h1>
          <p className="client-badge">
            Comprador: <strong>{client?.nombre}</strong> <span>({client?.email})</span>
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/pos')}>
          ← Cambiar Cliente
        </button>
      </header>

      {/* Manejo de Errores con opción de reintento */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="btn btn-retry" onClick={loadEvents}>
            Reintentar
          </button>
        </div>
      )}

      {/* Estado Vacío: Cuando la API responde bien pero no hay eventos 'published' */}
      {!error && events.length === 0 && (
        <div className="empty-state">
          <h3>No hay eventos disponibles</h3>
          <p>Actualmente no tenemos eventos publicados para la venta en taquilla.</p>
        </div>
      )}

      <div className="events-grid">
        {events.map(event => (
          <div
            key={event.id}
            className="card event-card"
            onClick={() => selectEvent(event)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') selectEvent(event); }}
          >
            <div className="event-poster">
              {event.posterUrl 
                ? <img src={event.posterUrl} alt={`Póster de ${event.name}`} loading="lazy" />
                : <div className="poster-placeholder">
                    <span>{event.name.charAt(0).toUpperCase()}</span>
                  </div>
              }
            </div>

            <div className="event-info">
              <div className="event-title-row">
                <h3 title={event.name}>{event.name}</h3>
                <span className="badge badge-primary">{event.eventTypeName}</span>
              </div>
              
              <p className="event-description" title={event.description}>
                {event.description || 'Sin descripción disponible'}
              </p>
              
              <div className="event-details">
                <p className="event-room">
                  <span aria-hidden="true">📍</span> {event.roomName}
                </p>
                <p className="event-date">
                  <span aria-hidden="true">📅</span> {formatDateTime(event.eventStartAt)}
                </p>
              </div>
              
              <div className="event-footer">
                <span className="action-link">Seleccionar asientos →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Eventos;