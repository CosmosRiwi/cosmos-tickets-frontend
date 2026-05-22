import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

function Dashboard() {
  const empleado = useAuthStore((state) => state.empleado)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <header>
        <h1>POS Cosmos Tickets</h1>
        <span>Bienvenido, {empleado?.nombre || 'Empleado'}</span>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <main>
        <h2>Nueva venta</h2>
        <p>Busca al cliente por correo para iniciar la venta</p>
        {/* Aquí irá el buscador de clientes */}
      </main>
    </div>
  )
}

export default Dashboard