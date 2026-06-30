import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null) // Modal ticket view
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchBookings()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5047/api/User/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
      setName(res.data.name)
    } catch {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5047/api/Booking/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
    } catch {
      setBookings([])
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put('http://localhost:5047/api/User/profile', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Profile name updated!')
      setEditing(false)
      fetchProfile()
    } catch {
      setMessage('Profile update failed.')
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release your seats.')) {
      return
    }
    try {
      await axios.delete(`http://localhost:5047/api/Booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchBookings()
    } catch {
      alert('Cancellation failed.')
    }
  }

  if (!profile) return <div style={styles.container}><p style={styles.message}>Loading profile...</p></div>

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoSho}>sho</span>
          <span style={styles.logoHoz}>hoz</span>
          <span style={styles.logoTag}>bus</span>
        </div>
        <button style={styles.homeBtn} onClick={() => navigate('/')}>Back to Home</button>
      </nav>

      <div style={styles.content}>
        {/* Profile Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>My Profile</h2>
          {editing ? (
            <div style={styles.editRow}>
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              <div style={{display:'flex', gap:'8px'}}>
                <button style={styles.saveBtn} onClick={handleUpdate}>Save</button>
                <button style={styles.cancelEditBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={styles.profileDetails}>
              <div style={styles.profileItem}>
                <span style={styles.profileLabel}>Name:</span>
                <span style={styles.profileVal}>{profile.name}</span>
              </div>
              <div style={styles.profileItem}>
                <span style={styles.profileLabel}>Email:</span>
                <span style={styles.profileVal}>{profile.email}</span>
              </div>
              <div style={styles.profileItem}>
                <span style={styles.profileLabel}>Role:</span>
                <span style={styles.profileVal}><span style={styles.roleBadge}>{profile.role.toUpperCase()}</span></span>
              </div>
              <button style={styles.editBtn} onClick={() => setEditing(true)}>Edit Profile Name</button>
            </div>
          )}
          {message && <p style={styles.successMessage}>{message}</p>}
        </div>

        {/* Bookings Section */}
        <h2 style={styles.subTitle}>My Booking History</h2>
        {bookings.length === 0 && (
          <div style={styles.emptyBookingsCard}>
            <span style={styles.emptyIcon}>🎫</span>
            <h3>No Bookings Found</h3>
            <p>You haven't booked any bus tickets yet. Start planning your journey today!</p>
            <button style={styles.bookNowBtn} onClick={() => navigate('/')}>Book Tickets Now</button>
          </div>
        )}

        {bookings.map((b) => (
          <div key={b.id} style={styles.bookingCard}>
            <div style={styles.bookingLeft}>
              <div style={styles.busHeader}>
                <h3 style={styles.busName}>{b.busRoute?.busName}</h3>
                <span style={styles.statusBadge}>{b.status.toUpperCase()}</span>
              </div>
              <div style={styles.bookingDetailsRow}>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>Route</span>
                  <span style={styles.detailVal}>{b.busRoute?.from} → {b.busRoute?.to}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>Journey Date</span>
                  <span style={styles.detailVal}>{b.journeyDate}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>Departure</span>
                  <span style={styles.detailVal}>{b.busRoute?.departureTime}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>Seat(s)</span>
                  <span style={{...styles.detailVal, color: '#00a75a'}}>{b.seats || 'N/A'}</span>
                </div>
                <div style={styles.detailCol}>
                  <span style={styles.detailLabel}>Total Fare</span>
                  <span style={styles.detailVal}>৳{b.totalPrice}</span>
                </div>
              </div>
            </div>
            <div style={styles.bookingRight}>
              <button style={styles.ticketBtn} onClick={() => setSelectedTicket(b)}>View Ticket</button>
              <button style={styles.cancelBtn} onClick={() => handleCancel(b.id)}>Cancel Ticket</button>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Modal Receipt */}
      {selectedTicket && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTicket(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.ticketBox}>
              <div style={styles.ticketHeader}>
                <div style={styles.ticketSuccessTitle}>CONFIRMED TICKET</div>
                <div style={styles.ticketLogo}>
                  <span style={styles.logoSho}>sho</span><span style={styles.logoHoz}>hoz</span>
                </div>
              </div>

              <div style={styles.ticketDottedDivider}></div>

              <div style={styles.ticketBody}>
                <h3 style={styles.ticketSectionTitle}>Digital Ticket Receipt</h3>
                <div style={styles.ticketGrid}>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Booking ID:</span>
                    <span style={styles.ticketVal}>#SB-{selectedTicket.id}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Passenger:</span>
                    <span style={styles.ticketVal}>{profile.name}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Mobile:</span>
                    <span style={styles.ticketVal}>{profile.email}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Bus Operator:</span>
                    <span style={styles.ticketVal}>{selectedTicket.busRoute?.busName}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Route:</span>
                    <span style={styles.ticketVal}>{selectedTicket.busRoute?.from} → {selectedTicket.busRoute?.to}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Journey Date:</span>
                    <span style={styles.ticketVal}>{selectedTicket.journeyDate}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Timings:</span>
                    <span style={styles.ticketVal}>{selectedTicket.busRoute?.departureTime} - {selectedTicket.busRoute?.arrivalTime}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Seat Number(s):</span>
                    <span style={{...styles.ticketVal, color: '#00a75a'}}>{selectedTicket.seats}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Fare Paid:</span>
                    <span style={{...styles.ticketVal, color: '#e63946'}}>৳{selectedTicket.totalPrice}</span>
                  </div>
                  <div style={styles.ticketItem}>
                    <span style={styles.ticketLabel}>Status:</span>
                    <span style={styles.paidBadge}>{selectedTicket.status.toUpperCase()}</span>
                  </div>
                </div>

                <div style={styles.barcodeWrapper}>
                  <div style={styles.barcodeLines}>
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 3, 2, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                      <div key={idx} style={{width: `${w}px`, background: '#1e293b', height: '40px', marginRight: '2px'}}></div>
                    ))}
                  </div>
                  <span style={styles.barcodeText}>*SB-{selectedTicket.id * 978}*</span>
                </div>
              </div>

              <div style={styles.ticketFooter}>
                <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Print Receipt</button>
                <button style={styles.closeBtn} onClick={() => setSelectedTicket(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    marginBottom: '40px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontSize: '28px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  logoSho: { color: '#00a75a' },
  logoHoz: { color: '#e63946' },
  logoTag: { background: '#00a75a', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700', textTransform: 'uppercase' },
  homeBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '8px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  message: { color: '#475569', fontSize: '16px', textAlign: 'center', marginTop: '100px' },

  content: { maxWidth: '850px', margin: '0 auto', padding: '0 20px' },
  card: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '28px', marginBottom: '36px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  subTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' },
  
  profileDetails: { display: 'flex', flexDirection: 'column', gap: '12px' },
  profileItem: { display: 'flex', gap: '12px', fontSize: '15px' },
  profileLabel: { color: '#64748b', fontWeight: '600', width: '80px' },
  profileVal: { color: '#1e293b', fontWeight: '700' },
  roleBadge: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' },
  editBtn: { alignSelf: 'flex-start', background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '12px' },

  editRow: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', color: '#1e293b', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '360px' },
  saveBtn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  cancelEditBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  successMessage: { color: '#166534', fontSize: '13px', marginTop: '12px' },

  emptyBookingsCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '50px', textAlign: 'center', color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  emptyIcon: { fontSize: '40px', display: 'inline-block', marginBottom: '16px' },
  bookNowBtn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '16px' },

  bookingCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  bookingLeft: { flex: 1, minWidth: '320px' },
  busHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  busName: { fontSize: '18px', fontWeight: '800', color: '#1e293b' },
  statusBadge: { background: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' },
  bookingDetailsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  detailCol: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  detailVal: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
  
  bookingRight: { display: 'flex', flexDirection: 'column', gap: '10px', width: '120px' },
  ticketBtn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '9px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' },
  cancelBtn: { background: 'transparent', color: '#e63946', border: '1px solid #e63946', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' },

  /* Modal overlay and content */
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { width: '100%', maxWidth: '640px', outline: 'none' },

  ticketBox: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' },
  ticketSuccessTitle: { color: '#00a75a', fontSize: '18px', fontWeight: '800' },
  ticketLogo: { fontSize: '24px', fontWeight: '800' },
  ticketDottedDivider: { borderTop: '2px dotted #cbd5e1', height: '1px', margin: '0 24px' },
  ticketBody: { padding: '24px' },
  ticketSectionTitle: { fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '16px' },
  ticketGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' },
  ticketItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  ticketLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  ticketVal: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
  paidBadge: { display: 'inline-block', width: 'fit-content', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' },
  barcodeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' },
  barcodeLines: { display: 'flex', justifyContent: 'center' },
  barcodeText: { fontSize: '12px', color: '#64748b', marginTop: '6px', letterSpacing: '2px' },
  ticketFooter: { background: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '20px 24px', display: 'flex', gap: '16px', justifyContent: 'flex-end' },
  printBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  closeBtn: { background: '#cbd5e1', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }
}

export default Profile