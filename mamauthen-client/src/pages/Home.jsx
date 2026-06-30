import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import axios from 'axios'

const CITIES = ['Pabna', 'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Natore', 'Kushtia', 'Sirajganj', 'Bogra'];

function Home() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t = localStorage.getItem('token')
    setToken(t)
    if (t) {
      axios.get('http://localhost:5047/api/User/profile', {
        headers: { Authorization: `Bearer ${t}` }
      }).then(res => {
        setUser(res.data)
        if (res.data.role === 'admin') setIsAdmin(true)
      }).catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
    }
  }, [])

  // Bidirectional local district rules for Pabna
  const handleFromChange = (val) => {
    setFrom(val)
    if (val !== 'Pabna' && val !== '') {
      setTo('Pabna')
    } else if (val === 'Pabna') {
      if (to === 'Pabna') setTo('')
    }
  }

  const handleToChange = (val) => {
    setTo(val)
    if (val !== 'Pabna' && val !== '') {
      setFrom('Pabna')
    } else if (val === 'Pabna') {
      if (from === 'Pabna') setFrom('')
    }
  }

  const handleSearch = () => {
    if (!from || !to || !date) {
      return alert('From, To, and Journey Date are required!')
    }
    if (from === to) {
      return alert('Origin and Destination cannot be the same!')
    }
    if (from !== 'Pabna' && to !== 'Pabna') {
      return alert('Invalid Route: Either Origin or Destination must be Pabna.')
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      return alert('Journey date cannot be in the past!')
    }

    navigate(`/search?from=${from}&to=${to}&date=${date}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAdmin(false)
    navigate('/')
  }

  const getFilteredToCities = () => {
    if (from === '') return CITIES;
    if (from !== 'Pabna') return ['Pabna'];
    return CITIES.filter(c => c !== 'Pabna');
  }

  const getFilteredFromCities = () => {
    if (to === '') return CITIES;
    if (to !== 'Pabna') return ['Pabna'];
    return CITIES.filter(c => c !== 'Pabna');
  }

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            <span>Mama</span><span style={{ color: '#e63946' }}>Uthen</span>
          </div>
          <div style={styles.menuLinks}>
            <div style={{...styles.menuItem, ...styles.menuItemActive}}>Bus</div>
            <div style={styles.menuItemDisabled}>Launch <span style={styles.badge}>Soon</span></div>
            <div style={styles.menuItemDisabled}>Train <span style={styles.badge}>Soon</span></div>
          </div>
        </div>
        <div style={styles.navRight}>
          {token ? (
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <span style={styles.welcomeText}>Hello, <strong>{user?.name || 'User'}</strong></span>
              {isAdmin && (
                <button style={styles.adminBtn} onClick={() => navigate('/admin')}>
                  Admin Panel
                </button>
              )}
              <button style={styles.profileBtn} onClick={() => navigate('/profile')}>
                My Bookings
              </button>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button style={styles.loginBtn} onClick={() => navigate('/login')}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero section with animation and text */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>
            Pabna's Premier<br />
            <span style={styles.greenText}>Bus Ticketing Gateway</span>
          </h2>
          <p style={styles.heroSubtitle}>
            Buy tickets locally to and from Pabna and surrounding districts. Quick, safe and zero-hassle.
          </p>
        </div>
        <div style={styles.lottieContainer}>
          <DotLottieReact src="/bus.json" loop autoplay style={{width:'100%', height:'100%'}} />
        </div>
      </div>

      {/* Booking Search Card */}
      <div style={styles.searchWrapper}>
        <div style={styles.searchCard}>
          <h3 style={styles.searchCardTitle}>Search Bus Tickets</h3>
          <div style={styles.searchRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>From (Origin)</label>
              <select 
                style={styles.select} 
                value={from} 
                onChange={(e) => handleFromChange(e.target.value)}
              >
                <option value="">Select Origin</option>
                {getFilteredFromCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div style={styles.swapBtn} onClick={() => {
              const temp = from;
              handleFromChange(to);
              handleToChange(temp);
            }}>
              ⇄
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>To (Destination)</label>
              <select 
                style={styles.select} 
                value={to} 
                onChange={(e) => handleToChange(e.target.value)}
              >
                <option value="">Select Destination</option>
                {getFilteredToCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Journey Date</label>
              <input 
                style={styles.input} 
                type="date" 
                value={date} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>

            <button style={styles.searchBtn} onClick={handleSearch}>
              Search Buses
            </button>
          </div>
          
          <div style={styles.alertBar}>
            <span style={styles.alertIcon}>ℹ️</span> 
            <span>Local route rules applied: Either Origin or Destination must be <strong>Pabna</strong>.</span>
          </div>
        </div>
      </div>

      {/* Popular routes and promo cards */}
      <div style={styles.infoSection}>
        <h3 style={styles.infoSectionTitle}>Popular Local Routes</h3>
        <div style={styles.routesGrid}>
          <div style={styles.routeCard} onClick={() => { handleFromChange('Dhaka'); handleToChange('Pabna'); }}>
            <div style={styles.routeText}>Dhaka ⇄ Pabna</div>
            <div style={styles.routeSubtext}>Daily services, AC & Non-AC</div>
          </div>
          <div style={styles.routeCard} onClick={() => { handleFromChange('Pabna'); handleToChange('Rajshahi'); }}>
            <div style={styles.routeText}>Pabna ⇄ Rajshahi</div>
            <div style={styles.routeSubtext}>Local shuttle & express services</div>
          </div>
          <div style={styles.routeCard} onClick={() => { handleFromChange('Kushtia'); handleToChange('Pabna'); }}>
            <div style={styles.routeText}>Kushtia ⇄ Pabna</div>
            <div style={styles.routeSubtext}>Frequent schedules, direct transit</div>
          </div>
          <div style={styles.routeCard} onClick={() => { handleFromChange('Pabna'); handleToChange('Natore'); }}>
            <div style={styles.routeText}>Pabna ⇄ Natore</div>
            <div style={styles.routeSubtext}>Short routes, budget pricing</div>
          </div>
        </div>

        <h3 style={{...styles.infoSectionTitle, marginTop:'60px'}}>Why Book With Shohoz Replica</h3>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>⚡</div>
            <h4 style={styles.featureTitle}>Instant Booking</h4>
            <p style={styles.featureText}>Avoid terminal lines. Pick your seats online in 30 seconds and secure your journey.</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🛡️</div>
            <h4 style={styles.featureTitle}>Secure Payments</h4>
            <p style={styles.featureText}>Safe payment methods with instant verification and guaranteed ticket delivery.</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🎫</div>
            <h4 style={styles.featureTitle}>Live Seats Inventory</h4>
            <p style={styles.featureText}>Select the exact seat you want directly from the real-time visual seat map.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerBrand}>
          Mama<span style={{ color: '#e63946' }}>Uthen</span>
        </div>
        <p style={styles.footerText}>© 2026 MamaUthen Bus Ticketing Portal (Pabna service). Developed for local and regional district transit.</p>
      </footer>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa' },
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 40px', 
    background: '#ffffff', 
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '40px' },
  logo: { fontSize: '28px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  logoSho: { color: '#00a75a' },
  logoHoz: { color: '#e63946' },
  logoTag: { background: '#00a75a', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700', textTransform: 'uppercase' },
  menuLinks: { display: 'flex', gap: '20px' },
  menuItem: { fontSize: '15px', fontWeight: '600', color: '#2c3e50', cursor: 'pointer', paddingBottom: '4px' },
  menuItemActive: { color: '#00a75a', borderBottom: '3px solid #00a75a' },
  menuItemDisabled: { fontSize: '15px', fontWeight: '500', color: '#94a3b8', position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' },
  badge: { fontSize: '9px', background: '#e2e8f0', color: '#64748b', padding: '1px 4px', borderRadius: '4px', fontWeight: '600' },
  navRight: {},
  loginBtn: { background: '#00a75a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' },
  logoutBtn: { background: 'transparent', color: '#e63946', border: '1px solid #e63946', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  adminBtn: { background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' },
  profileBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginRight: '8px' },
  welcomeText: { color: '#475569', fontSize: '14px' },
  
  heroSection: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 80px 100px 80px', background: 'linear-gradient(135deg, #00a75a 0%, #008f4c 100%)', color: '#ffffff', minHeight: '320px' },
  heroContent: { flex: 1, paddingRight: '40px' },
  heroTitle: { fontSize: '44px', fontWeight: '900', color: '#ffffff', lineHeight: '1.2', marginBottom: '16px' },
  greenText: { color: '#ffe66d' },
  heroSubtitle: { fontSize: '16px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '480px' },
  lottieContainer: { width: '360px', height: '260px' },
  
  searchWrapper: { marginTop: '-60px', padding: '0 40px', display: 'flex', justifyContent: 'center' },
  searchCard: { background: '#ffffff', width: '100%', maxWidth: '1000px', borderRadius: '12px', padding: '24px 32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
  searchCardTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  searchRow: { display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' },
  inputGroup: { flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  select: { width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px 14px', color: '#1e293b', fontSize: '15px', outline: 'none', cursor: 'pointer' },
  input: { width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', color: '#1e293b', fontSize: '15px', outline: 'none' },
  swapBtn: { color: '#00a75a', fontSize: '24px', cursor: 'pointer', paddingBottom: '10px', userSelect: 'none', fontWeight: '700' },
  searchBtn: { background: '#e63946', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '6px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', alignSelf: 'flex-end', height: '46px' },
  alertBar: { marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' },
  alertIcon: { fontSize: '15px' },

  infoSection: { maxWidth: '1000px', margin: '60px auto', padding: '0 20px' },
  infoSectionTitle: { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', textAlign: 'center' },
  routesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  routeCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  routeText: { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  routeSubtext: { fontSize: '12px', color: '#64748b' },

  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },
  featureItem: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '30px', textAlign: 'center' },
  featureIcon: { fontSize: '32px', marginBottom: '16px' },
  featureTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' },
  featureText: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' },

  footer: { borderTop: '1px solid #cbd5e1', background: '#ffffff', padding: '40px 20px', textAlign: 'center', marginTop: '80px' },
  footerBrand: { fontSize: '20px', fontWeight: '800', marginBottom: '12px' },
  footerText: { fontSize: '13px', color: '#94a3b8' }
}

export default Home