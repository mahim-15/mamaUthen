import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function SearchResults() {
  const [routes, setRoutes] = useState([])
  const [filteredRoutes, setFilteredRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  // Expanded card state for seat selection
  const [expandedRouteId, setExpandedRouteId] = useState(null)
  const [bookedSeats, setBookedSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [boardingPoint, setBoardingPoint] = useState('')
  const [droppingPoint, setDroppingPoint] = useState('')

  // Filter States
  const [selectedOperators, setSelectedOperators] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedTimes, setSelectedTimes] = useState([])

  useEffect(() => {
    fetchRoutes()
  }, [from, to, date])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:5047/api/BusRoute/search?from=${from}&to=${to}&date=${date}`)
      setRoutes(res.data)
      setFilteredRoutes(res.data)
    } catch (err) {
      setRoutes([])
      setFilteredRoutes([])
    } finally {
      setLoading(false)
    }
  }

  // Handle View Seats toggle
  const handleToggleSeats = async (routeId) => {
    if (expandedRouteId === routeId) {
      setExpandedRouteId(null)
      setSelectedSeats([])
      setBoardingPoint('')
      setBoardingPoint('')
      setDroppingPoint('')
      return
    }

    setExpandedRouteId(routeId)
    setSelectedSeats([])
    setBoardingPoint('')
    setDroppingPoint('')

    // Fetch booked seats from the backend
    try {
      const res = await axios.get(`http://localhost:5047/api/BusRoute/${routeId}/booked-seats?date=${date}`)
      setBookedSeats(res.data)
    } catch {
      setBookedSeats([])
    }
  }

  // Seat toggle selection
  const handleSeatClick = (seatName) => {
    if (bookedSeats.includes(seatName)) return; // Already booked

    if (selectedSeats.includes(seatName)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatName))
    } else {
      if (selectedSeats.length >= 4) {
        alert('You can select a maximum of 4 seats!')
        return
      }
      setSelectedSeats([...selectedSeats, seatName])
    }
  }

  const handleBook = (routeId, price) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first to book tickets!')
      navigate('/login')
      return
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat!')
      return
    }
    if (!boardingPoint) {
      alert('Please select a boarding point!')
      return
    }
    if (!droppingPoint) {
      alert('Please select a dropping point!')
      return
    }

    navigate(`/book/${routeId}?seats=${selectedSeats.join(',')}&date=${date}&boarding=${boardingPoint}&dropping=${droppingPoint}`)
  }

  // Filter application
  useEffect(() => {
    let result = [...routes];

    // Filter by Operator
    if (selectedOperators.length > 0) {
      result = result.filter(r => {
        const opName = getOperatorName(r.busName);
        return selectedOperators.includes(opName);
      });
    }

    // Filter by AC Type
    if (selectedTypes.length > 0) {
      result = result.filter(r => {
        const isAC = r.busName.toUpperCase().includes('AC');
        const typeStr = isAC ? 'AC' : 'Non-AC';
        return selectedTypes.includes(typeStr);
      });
    }

    // Filter by Time
    if (selectedTimes.length > 0) {
      result = result.filter(r => {
        const timeOfDay = getTimeOfDay(r.departureTime);
        return selectedTimes.includes(timeOfDay);
      });
    }

    setFilteredRoutes(result);
  }, [selectedOperators, selectedTypes, selectedTimes, routes])

  // Helpers
  const getOperatorName = (busName) => {
    return busName.split(' ')[0];
  };

  const getTimeOfDay = (timeStr) => {
    // Basic detection for AM/PM
    const isPM = timeStr.toUpperCase().includes('PM');
    const hour = parseInt(timeStr.split(':')[0]);
    if (!isPM) {
      if (hour >= 6 && hour < 12) return 'Morning';
      return 'Night'; // 12 AM - 6 AM is night
    } else {
      if (hour === 12 || hour < 6) return 'Afternoon';
      return 'Night'; // 6 PM - 12 AM is night
    }
  };

  // Get distinct operators
  const operatorsList = [...new Set(routes.map(r => getOperatorName(r.busName)))];

  // Get Boarding/Dropping Points based on route
  const getBoardingPoints = () => {
    if (from === 'Pabna') {
      return ['Pabna Terminal', 'Pabna Bypass', 'Ishwardi Bus Stand'];
    } else {
      return [`${from} Bus Stand`, `${from} Counter A`, `${from} Bypass`];
    }
  }

  const getDroppingPoints = () => {
    if (to === 'Pabna') {
      return ['Pabna Terminal', 'Pabna Bypass', 'Ishwardi Bus Stand'];
    } else {
      return [`${to} Terminal`, `${to} Counter B`, `${to} Bypass`];
    }
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span>Mama</span><span style={{ color: '#e63946' }}>Uthen</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            Modify Search
          </button>
        </div>
      </nav>

      {/* Route Info Banner */}
      <div style={styles.infoBanner}>
        <div style={styles.infoBannerContainer}>
          <div style={styles.routeHeader}>
            <span style={styles.routeLabel}>Route:</span>
            <span style={styles.routeVal}>{from} → {to}</span>
          </div>
          <div style={styles.dateHeader}>
            <span style={styles.dateLabel}>Date of Journey:</span>
            <span style={styles.dateVal}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div style={styles.mainLayout}>
        {/* Left Filters Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>Bus Operators</h4>
            {operatorsList.map(op => (
              <label key={op} style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={selectedOperators.includes(op)} 
                  onChange={(e) => {
                    if (e.target.checked) setSelectedOperators([...selectedOperators, op])
                    else setSelectedOperators(selectedOperators.filter(x => x !== op))
                  }}
                  style={styles.checkbox}
                />
                {op}
              </label>
            ))}
            {operatorsList.length === 0 && <p style={styles.emptyFilter}>No operators available</p>}
          </div>

          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>Bus Type</h4>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedTypes.includes('AC')} 
                onChange={(e) => {
                  if (e.target.checked) setSelectedTypes([...selectedTypes, 'AC'])
                  else setSelectedTypes(selectedTypes.filter(x => x !== 'AC'))
                }}
                style={styles.checkbox}
              />
              AC
            </label>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedTypes.includes('Non-AC')} 
                onChange={(e) => {
                  if (e.target.checked) setSelectedTypes([...selectedTypes, 'Non-AC'])
                  else setSelectedTypes(selectedTypes.filter(x => x !== 'Non-AC'))
                }}
                style={styles.checkbox}
              />
              Non-AC
            </label>
          </div>

          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>Departure Time</h4>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedTimes.includes('Morning')} 
                onChange={(e) => {
                  if (e.target.checked) setSelectedTimes([...selectedTimes, 'Morning'])
                  else setSelectedTimes(selectedTimes.filter(x => x !== 'Morning'))
                }}
                style={styles.checkbox}
              />
              Morning (06:00 AM - 12:00 PM)
            </label>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedTimes.includes('Afternoon')} 
                onChange={(e) => {
                  if (e.target.checked) setSelectedTimes([...selectedTimes, 'Afternoon'])
                  else setSelectedTimes(selectedTimes.filter(x => x !== 'Afternoon'))
                }}
                style={styles.checkbox}
              />
              Afternoon (12:00 PM - 06:00 PM)
            </label>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedTimes.includes('Night')} 
                onChange={(e) => {
                  if (e.target.checked) setSelectedTimes([...selectedTimes, 'Night'])
                  else setSelectedTimes(selectedTimes.filter(x => x !== 'Night'))
                }}
                style={styles.checkbox}
              />
              Night (06:00 PM - 06:00 AM)
            </label>
          </div>
        </aside>

        {/* Right Bus Results List */}
        <section style={styles.resultsContainer}>
          {loading && (
            <div style={styles.loadingBox}>
              <span style={styles.loadingSpinner}>⏳</span>
              <p>Searching for available buses...</p>
            </div>
          )}

          {!loading && filteredRoutes.length === 0 && (
            <div style={styles.noResultsCard}>
              <span style={styles.noResultsIcon}>🚌</span>
              <h3>No Buses Found</h3>
              <p>We couldn't find any buses fitting your route search on this date. Try changing dates or filters.</p>
            </div>
          )}

          {!loading && filteredRoutes.map(route => {
            const isExpanded = expandedRouteId === route.id;
            const isAC = route.busName.toUpperCase().includes('AC');
            return (
              <div key={route.id} style={styles.routeCard}>
                <div style={styles.routeSummary}>
                  <div style={styles.columnBus}>
                    <h3 style={styles.operatorName}>{route.busName}</h3>
                    <span style={isAC ? styles.badgeAC : styles.badgeNonAC}>
                      {isAC ? 'AC Business Class' : 'Non-AC Economy'}
                    </span>
                  </div>

                  <div style={styles.columnTime}>
                    <div style={styles.timeValue}>{route.departureTime}</div>
                    <div style={styles.timeLabel}>Departure</div>
                  </div>

                  <div style={styles.columnDuration}>
                    <div style={styles.durationLine}></div>
                    <span style={styles.durationBadge}>~5h 30m</span>
                  </div>

                  <div style={styles.columnTime}>
                    <div style={styles.timeValue}>{route.arrivalTime}</div>
                    <div style={styles.timeLabel}>Arrival</div>
                  </div>

                  <div style={styles.columnSeats}>
                    <div style={styles.seatsValue}>{route.availableSeats}</div>
                    <div style={styles.seatsLabel}>Seats Available</div>
                  </div>

                  <div style={styles.columnPrice}>
                    <div style={styles.priceValue}>৳{route.price}</div>
                    <button 
                      style={isExpanded ? styles.viewSeatsBtnActive : styles.viewSeatsBtn} 
                      onClick={() => handleToggleSeats(route.id)}
                    >
                      {isExpanded ? 'Hide Seats' : 'View Seats'}
                    </button>
                  </div>
                </div>

                {/* Expanded Seat Selection */}
                {isExpanded && (
                  <div style={styles.expandedSection} className="slide-down">
                    <div style={styles.seatsLayoutGrid}>
                      {/* Left: Bus Seat Selector */}
                      <div style={styles.seatGridContainer}>
                        <div style={styles.busFront}>
                          <span style={styles.driverLabel}>Front / Driver</span>
                          <span style={styles.steeringWheel}>☸️</span>
                        </div>
                        <div style={styles.busBody}>
                          {SEAT_ROWS.map(row => (
                            <div key={row} style={styles.seatRow}>
                              {/* Left Columns (1, 2) */}
                              <div style={styles.seatGroup}>
                                {['1', '2'].map(col => {
                                  const seatName = `${row}${col}`;
                                  const isBooked = bookedSeats.includes(seatName);
                                  const isSelected = selectedSeats.includes(seatName);

                                  let seatStyle = styles.seatAvailable;
                                  if (isBooked) seatStyle = styles.seatBooked;
                                  else if (isSelected) seatStyle = styles.seatSelected;

                                  return (
                                    <button 
                                      key={seatName}
                                      style={seatStyle}
                                      onClick={() => handleSeatClick(seatName)}
                                      disabled={isBooked}
                                      title={isBooked ? `Seat ${seatName} (Booked)` : `Seat ${seatName}`}
                                    >
                                      {seatName}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Corridor spacer */}
                              <div style={styles.corridor}></div>

                              {/* Right Columns (3, 4) */}
                              <div style={styles.seatGroup}>
                                {['3', '4'].map(col => {
                                  const seatName = `${row}${col}`;
                                  const isBooked = bookedSeats.includes(seatName);
                                  const isSelected = selectedSeats.includes(seatName);

                                  let seatStyle = styles.seatAvailable;
                                  if (isBooked) seatStyle = styles.seatBooked;
                                  else if (isSelected) seatStyle = styles.seatSelected;

                                  return (
                                    <button 
                                      key={seatName}
                                      style={seatStyle}
                                      onClick={() => handleSeatClick(seatName)}
                                      disabled={isBooked}
                                      title={isBooked ? `Seat ${seatName} (Booked)` : `Seat ${seatName}`}
                                    >
                                      {seatName}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Booking Summary Form */}
                      <div style={styles.summaryForm}>
                        <h4 style={styles.summaryTitle}>Booking Summary</h4>
                        
                        {/* Legend */}
                        <div style={styles.legendRow}>
                          <div style={styles.legendItem}>
                            <span style={{...styles.legendColor, ...styles.seatAvailable}}></span>
                            <span>Available</span>
                          </div>
                          <div style={styles.legendItem}>
                            <span style={{...styles.legendColor, ...styles.seatBooked}}></span>
                            <span>Booked</span>
                          </div>
                          <div style={styles.legendItem}>
                            <span style={{...styles.legendColor, ...styles.seatSelected}}></span>
                            <span>Selected</span>
                          </div>
                        </div>

                        {/* Selected Seats info */}
                        <div style={styles.formRow}>
                          <span style={styles.formLabel}>Selected Seats:</span>
                          <span style={styles.formValue}>
                            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                          </span>
                        </div>

                        {/* Boarding/Dropping Selectors */}
                        <div style={styles.formField}>
                          <label style={styles.fieldLabel}>Boarding Point</label>
                          <select 
                            style={styles.fieldSelect}
                            value={boardingPoint}
                            onChange={(e) => setBoardingPoint(e.target.value)}
                          >
                            <option value="">Select Boarding Point</option>
                            {getBoardingPoints().map(bp => (
                              <option key={bp} value={bp}>{bp}</option>
                            ))}
                          </select>
                        </div>

                        <div style={styles.formField}>
                          <label style={styles.fieldLabel}>Dropping Point</label>
                          <select 
                            style={styles.fieldSelect}
                            value={droppingPoint}
                            onChange={(e) => setDroppingPoint(e.target.value)}
                          >
                            <option value="">Select Dropping Point</option>
                            {getDroppingPoints().map(dp => (
                              <option key={dp} value={dp}>{dp}</option>
                            ))}
                          </select>
                        </div>

                        {/* Price Details */}
                        <div style={styles.pricingCard}>
                          <div style={styles.priceRow}>
                            <span>Seat Fare ({selectedSeats.length} x ৳{route.price})</span>
                            <span>৳{selectedSeats.length * route.price}</span>
                          </div>
                          <div style={styles.priceRow}>
                            <span>Processing Fee</span>
                            <span>৳{selectedSeats.length > 0 ? 50 : 0}</span>
                          </div>
                          <div style={{...styles.priceRow, ...styles.priceRowTotal}}>
                            <span>Grand Total</span>
                            <span>৳{selectedSeats.length > 0 ? (selectedSeats.length * route.price + 50) : 0}</span>
                          </div>
                        </div>

                        <button 
                          style={styles.bookConfirmBtn}
                          onClick={() => handleBook(route.id, route.price)}
                          disabled={selectedSeats.length === 0}
                        >
                          Continue to Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f4f6f9' },
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 40px', 
    background: '#ffffff', 
    borderBottom: '1px solid #cbd5e1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  logo: { fontSize: '28px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  logoSho: { color: '#00a75a' },
  logoHoz: { color: '#e63946' },
  logoTag: { background: '#00a75a', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700', textTransform: 'uppercase' },
  navRight: {},
  backBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' },

  infoBanner: { background: '#2c3e50', color: '#ffffff', padding: '15px 40px' },
  infoBannerContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  routeHeader: { display: 'flex', gap: '8px', fontSize: '16px' },
  routeLabel: { color: '#94a3b8' },
  routeVal: { fontWeight: '700' },
  dateHeader: { display: 'flex', gap: '8px', fontSize: '15px' },
  dateLabel: { color: '#94a3b8' },
  dateVal: { fontWeight: '600' },

  mainLayout: { maxWidth: '1200px', margin: '40px auto', display: 'flex', gap: '30px', padding: '0 20px' },
  sidebar: { width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' },
  filterGroup: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  filterTitle: { fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', textTransform: 'uppercase' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569', marginBottom: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', accentColor: '#00a75a', cursor: 'pointer' },
  emptyFilter: { color: '#94a3b8', fontSize: '13px' },

  resultsContainer: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  loadingBox: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '60px', textAlign: 'center', color: '#475569' },
  loadingSpinner: { fontSize: '32px', display: 'inline-block', marginBottom: '12px' },
  noResultsCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '60px', textAlign: 'center', color: '#475569' },
  noResultsIcon: { fontSize: '48px', display: 'inline-block', marginBottom: '16px' },

  routeCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s' },
  routeSummary: { display: 'flex', alignItems: 'center', padding: '24px', flexWrap: 'wrap', gap: '20px' },
  columnBus: { flex: 1, minWidth: '180px' },
  operatorName: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' },
  badgeAC: { background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' },
  badgeNonAC: { background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' },
  columnTime: { width: '100px', textAlign: 'center' },
  timeValue: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  timeLabel: { fontSize: '12px', color: '#64748b' },
  columnDuration: { width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  durationLine: { height: '2px', background: '#cbd5e1', width: '100%', position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 1 },
  durationBadge: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', position: 'relative', zIndex: 2 },
  columnSeats: { width: '120px', textAlign: 'center' },
  seatsValue: { fontSize: '20px', fontWeight: '800', color: '#00a75a' },
  seatsLabel: { fontSize: '11px', color: '#64748b' },
  columnPrice: { width: '160px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' },
  priceValue: { fontSize: '22px', fontWeight: '800', color: '#e63946' },
  viewSeatsBtn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
  viewSeatsBtnActive: { background: '#2c3e50', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },

  expandedSection: { borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '30px' },
  seatsLayoutGrid: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  
  seatGridContainer: { flex: 1, minWidth: '300px', maxWidth: '380px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' },
  busFront: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' },
  driverLabel: { fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#94a3b8' },
  steeringWheel: { fontSize: '24px' },
  busBody: { display: 'flex', flexDirection: 'column', gap: '8px' },
  seatRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  seatGroup: { display: 'flex', gap: '8px' },
  corridor: { width: '30px' },
  seatAvailable: { width: '36px', height: '36px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', transition: 'all 0.15s' },
  seatBooked: { width: '36px', height: '36px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', outline: 'none' },
  seatSelected: { width: '36px', height: '36px', background: '#00a75a', border: '1px solid #00a75a', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', boxShadow: '0 0 8px rgba(0, 167, 90, 0.4)' },

  summaryForm: { width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' },
  summaryTitle: { fontSize: '16px', fontWeight: '800', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' },
  legendRow: { display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  legendColor: { width: '14px', height: '14px', borderRadius: '3px', border: '1px solid #cbd5e1' },
  formRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' },
  formLabel: { color: '#64748b', fontWeight: '600' },
  formValue: { fontWeight: '700', color: '#00a75a' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '12px', fontWeight: '600', color: '#475569' },
  fieldSelect: { width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', color: '#1e293b', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  pricingCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' },
  priceRowTotal: { borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '4px', fontSize: '16px', fontWeight: '800', color: '#e63946' },
  bookConfirmBtn: { background: '#e63946', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s', width: '100%', outline: 'none' }
}

export default SearchResults