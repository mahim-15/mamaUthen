import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminPanel() {
  const [routes, setRoutes] = useState([])
  const [isBidirectional, setIsBidirectional] = useState(false)
  const [form, setForm] = useState({
    busName: '', from: '', to: '', departureTime: '', arrivalTime: '',
    price: '', totalSeats: '', availableSeats: ''
  })
  const [bidiForm, setBidiForm] = useState({
    busName: '',
    destinationName: '',
    departureTimeFromPabna: '',
    arrivalTimeToDestination: '',
    departureTimeFromDestination: '',
    arrivalTimeToPabna: '',
    price: '',
    totalSeats: ''
  })
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('http://localhost:5047/api/BusRoute')
      setRoutes(res.data)
    } catch {
      setRoutes([])
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleBidiChange = (e) => {
    setBidiForm({ ...bidiForm, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm({ busName: '', from: '', to: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '', availableSeats: '' })
    setBidiForm({
      busName: '', destinationName: '',
      departureTimeFromPabna: '', arrivalTimeToDestination: '',
      departureTimeFromDestination: '', arrivalTimeToPabna: '',
      price: '', totalSeats: ''
    })
    setEditId(null)
    setMessage('')
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    if (isBidirectional && !editId) {
      // Validate Bidirectional form
      if (!bidiForm.busName || !bidiForm.destinationName || !bidiForm.departureTimeFromPabna || 
          !bidiForm.arrivalTimeToDestination || !bidiForm.departureTimeFromDestination || 
          !bidiForm.arrivalTimeToPabna || !bidiForm.price || !bidiForm.totalSeats) {
        setError('Please fill in all bidirectional route fields.')
        return
      }

      if (bidiForm.destinationName.trim().toLowerCase() === 'pabna') {
        setError('Destination cannot be Pabna. The origin is already set to Pabna.')
        return
      }

      const payload = {
        busName: bidiForm.busName.trim(),
        destinationName: bidiForm.destinationName.trim(),
        departureTimeFromPabna: bidiForm.departureTimeFromPabna.trim(),
        arrivalTimeToDestination: bidiForm.arrivalTimeToDestination.trim(),
        departureTimeFromDestination: bidiForm.departureTimeFromDestination.trim(),
        arrivalTimeToPabna: bidiForm.arrivalTimeToPabna.trim(),
        price: parseFloat(bidiForm.price),
        totalSeats: parseInt(bidiForm.totalSeats)
      }

      try {
        await axios.post('http://localhost:5047/api/BusRoute/bulk-bidirectional', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessage('Round-trip routes (Outbound & Return) added successfully!')
        resetForm()
        fetchRoutes()
      } catch (err) {
        setError(err.response?.data || 'Failed to create bidirectional routes')
      }
    } else {
      // Validate Standard One-way route form
      if (!form.busName || !form.from || !form.to || !form.departureTime || !form.arrivalTime || !form.price || !form.totalSeats) {
        setError('Please fill in all route fields.')
        return
      }

      const origin = form.from.trim();
      const destination = form.to.trim();
      if (origin.toLowerCase() !== 'pabna' && destination.toLowerCase() !== 'pabna') {
        setError('Invalid Route: Either Origin (From) or Destination (To) must be Pabna.')
        return
      }

      const payload = {
        busName: form.busName.trim(),
        from: origin,
        to: destination,
        departureTime: form.departureTime.trim(),
        arrivalTime: form.arrivalTime.trim(),
        price: parseFloat(form.price),
        totalSeats: parseInt(form.totalSeats),
        availableSeats: form.availableSeats ? parseInt(form.availableSeats) : parseInt(form.totalSeats)
      }

      try {
        if (editId) {
          await axios.put(`http://localhost:5047/api/BusRoute/${editId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setMessage('Route updated successfully!')
        } else {
          await axios.post('http://localhost:5047/api/BusRoute', payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setMessage('Route added successfully!')
        }
        resetForm()
        fetchRoutes()
      } catch (err) {
        setError(err.response?.data || 'Action failed — admin access required')
      }
    }
  }

  const handleEdit = (route) => {
    setIsBidirectional(false)
    setForm({
      busName: route.busName, from: route.from, to: route.to,
      departureTime: route.departureTime, arrivalTime: route.arrivalTime,
      price: route.price, totalSeats: route.totalSeats, availableSeats: route.availableSeats
    })
    setEditId(route.id)
    setError('')
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return
    try {
      await axios.delete(`http://localhost:5047/api/BusRoute/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Route deleted!')
      fetchRoutes()
    } catch {
      setError('Failed to delete route.')
    }
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoSho}>sho</span>
          <span style={styles.logoHoz}>hoz</span>
          <span style={styles.logoTag}>bus</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.adminTag}>Admin Console</span>
          <button style={styles.homeBtn} onClick={() => navigate('/')}>Home</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Route Management Form */}
        <div style={styles.card}>
          <h2 style={styles.title}>{editId ? '📝 Edit Bus Route' : '➕ Add New Bus Route'}</h2>
          
          {!editId && (
            <div style={styles.toggleRow}>
              <button 
                style={!isBidirectional ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setIsBidirectional(false)}
              >
                One-Way Route
              </button>
              <button 
                style={isBidirectional ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setIsBidirectional(true)}
              >
                Round Trip Route (Bidirectional)
              </button>
            </div>
          )}

          {isBidirectional && !editId ? (
            <div style={styles.grid}>
              <div style={styles.formField}>
                <label style={styles.label}>Bus Name / Operator</label>
                <input style={styles.input} name="busName" placeholder="e.g. Hanif Enterprise AC" value={bidiForm.busName} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Destination Name</label>
                <input style={styles.input} name="destinationName" placeholder="e.g. Dhaka" value={bidiForm.destinationName} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Departure Time from Pabna</label>
                <input style={styles.input} name="departureTimeFromPabna" placeholder="e.g. 08:30 AM" value={bidiForm.departureTimeFromPabna} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Arrival Time to Destination</label>
                <input style={styles.input} name="arrivalTimeToDestination" placeholder="e.g. 02:00 PM" value={bidiForm.arrivalTimeToDestination} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Departure Time from Destination</label>
                <input style={styles.input} name="departureTimeFromDestination" placeholder="e.g. 10:30 PM" value={bidiForm.departureTimeFromDestination} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Arrival Time to Pabna</label>
                <input style={styles.input} name="arrivalTimeToPabna" placeholder="e.g. 04:00 AM" value={bidiForm.arrivalTimeToPabna} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Ticket Fare (Price)</label>
                <input style={styles.input} name="price" placeholder="e.g. 1200" type="number" value={bidiForm.price} onChange={handleBidiChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Total Seat Capacity</label>
                <input style={styles.input} name="totalSeats" placeholder="e.g. 40" type="number" value={bidiForm.totalSeats} onChange={handleBidiChange} />
              </div>
            </div>
          ) : (
            <div style={styles.grid}>
              <div style={styles.formField}>
                <label style={styles.label}>Bus Name / Operator</label>
                <input style={styles.input} name="busName" placeholder="e.g. Hanif Enterprise AC" value={form.busName} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Origin (From)</label>
                <input style={styles.input} name="from" placeholder="e.g. Pabna" value={form.from} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Destination (To)</label>
                <input style={styles.input} name="to" placeholder="e.g. Dhaka" value={form.to} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Departure Time</label>
                <input style={styles.input} name="departureTime" placeholder="e.g. 08:30 AM" value={form.departureTime} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Arrival Time</label>
                <input style={styles.input} name="arrivalTime" placeholder="e.g. 02:00 PM" value={form.arrivalTime} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Ticket Fare (Price)</label>
                <input style={styles.input} name="price" placeholder="e.g. 750" type="number" value={form.price} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Total Seat Capacity</label>
                <input style={styles.input} name="totalSeats" placeholder="e.g. 40" type="number" value={form.totalSeats} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Available Seats (Optional)</label>
                <input style={styles.input} name="availableSeats" placeholder="Leave empty for full capacity" type="number" value={form.availableSeats} onChange={handleChange} />
              </div>
            </div>
          )}

          {message && <div style={styles.successBox}>{message}</div>}
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={{display:'flex', gap:'12px', marginTop:'24px'}}>
            <button style={styles.btn} onClick={handleSubmit}>{editId ? 'Update Route' : 'Create Route'}</button>
            {(editId || form.busName || bidiForm.busName) && <button style={styles.cancelEditBtn} onClick={resetForm}>Clear Form</button>}
          </div>
        </div>

        {/* Routes Listing */}
        <h2 style={styles.subTitle}>Current Bus Routes</h2>
        {routes.length === 0 && <p style={styles.emptyText}>No bus routes available in the system.</p>}
        
        {routes.map((route) => {
          const isAC = route.busName.toUpperCase().includes('AC');
          return (
            <div key={route.id} style={styles.routeCard}>
              <div style={styles.routeLeft}>
                <div style={styles.routeHeader}>
                  <h3 style={styles.busName}>{route.busName}</h3>
                  <span style={isAC ? styles.badgeAC : styles.badgeNonAC}>{isAC ? 'AC' : 'Non-AC'}</span>
                </div>
                <div style={styles.routeDetails}>
                  <span><strong>From:</strong> {route.from}</span>
                  <span><strong>To:</strong> {route.to}</span>
                  <span><strong>Time:</strong> {route.departureTime} - {route.arrivalTime}</span>
                  <span><strong>Fare:</strong> ৳{route.price}</span>
                  <span><strong>Seats:</strong> {route.availableSeats}/{route.totalSeats}</span>
                </div>
              </div>
              <div style={styles.routeRight}>
                <button style={styles.editBtn} onClick={() => handleEdit(route)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(route.id)}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f4f6f9', paddingBottom: '60px' },
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 40px', 
    background: '#ffffff', 
    borderBottom: '1px solid #cbd5e1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '40px'
  },
  logo: { fontSize: '28px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  logoSho: { color: '#00a75a' },
  logoHoz: { color: '#e63946' },
  logoTag: { background: '#00a75a', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  adminTag: { color: '#00a75a', fontSize: '12px', fontWeight: '800', border: '1.5px solid #00a75a', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' },
  homeBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  toggleRow: { display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' },
  toggleBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' },
  toggleBtnActive: { background: '#00a75a', color: '#ffffff', border: '1px solid #00a75a', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' },

  content: { maxWidth: '850px', margin: '0 auto', padding: '0 20px' },
  card: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '28px', marginBottom: '36px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  title: { fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' },
  subTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#475569' },
  input: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', color: '#1e293b', fontSize: '14px', outline: 'none' },

  successBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '16px' },
  errorBox: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '6px', fontSize: '13px', marginTop: '16px' },
  btn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  cancelEditBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },

  emptyText: { color: '#94a3b8', fontSize: '14px' },
  routeCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  routeLeft: { flex: 1 },
  routeHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  busName: { fontSize: '16px', fontWeight: '800', color: '#1e293b' },
  badgeAC: { background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' },
  badgeNonAC: { background: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' },
  routeDetails: { display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' },

  routeRight: { display: 'flex', gap: '8px', width: '150px', justifyContent: 'flex-end' },
  editBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  deleteBtn: { background: 'transparent', color: '#e63946', border: '1px solid #e63946', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }
}

export default AdminPanel