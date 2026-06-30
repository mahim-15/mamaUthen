import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

function BookingPage() {
  const { routeId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const seats = searchParams.get('seats') || ''
  const date = searchParams.get('date') || ''
  const boarding = searchParams.get('boarding') || ''
  const dropping = searchParams.get('dropping') || ''

  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('Male')
  const [paymentMethod, setPaymentMethod] = useState('bkash')

  // Mock payment details
  const [paymentPhone, setPaymentPhone] = useState('')
  const [paymentOtp, setPaymentOtp] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axios.get(`http://localhost:5047/api/BusRoute/${routeId}`)
        setRoute(res.data)
      } catch {
        setError('Could not fetch route details.')
      } finally {
        setLoading(false)
      }
    }
    fetchRoute()
  }, [routeId])

  const handleBooking = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to book tickets!')
      navigate('/login')
      return
    }

    if (!name || !phone || !email) {
      alert('Please fill out all passenger details.')
      return
    }

    // Basic Bangladeshi phone validation
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      alert('Please enter a valid Bangladeshi mobile number.')
      return
    }

    // Payment validation
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!paymentPhone || !paymentOtp) {
        alert(`Please complete the ${paymentMethod} payment form.`)
        return
      }
    } else {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        alert('Please complete the card details form.')
        return
      }
    }

    try {
      const res = await axios.post(
        'http://localhost:5047/api/Booking',
        { 
          busRouteId: parseInt(routeId), 
          seats: seats, 
          journeyDate: date 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookingDetails(res.data)
      setSuccess(true)
      setError('')
    } catch (err) {
      setError(err.response?.data || 'Booking failed. The seat might have been booked already.')
    }
  }

  const seatList = seats.split(',').filter(x => x)
  const seatCount = seatList.length

  if (loading) return <div style={styles.container}><p style={styles.message}>Loading checkout details...</p></div>
  if (!route) return <div style={styles.container}><p style={styles.message}>{error || 'Route not found'}</p></div>

  const ticketFare = route.price * seatCount
  const processingFee = 50
  const grandTotal = ticketFare + processingFee

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoSho}>sho</span>
          <span style={styles.logoHoz}>hoz</span>
          <span style={styles.logoTag}>bus</span>
        </div>
      </nav>

      <div style={styles.content}>
        {success ? (
          // Stylized Shohoz Digital Ticket Receipt
          <div style={styles.ticketBox} className="fade-in">
            <div style={styles.ticketHeader}>
              <div style={styles.ticketSuccessTitle}>🎉 Booking Successful!</div>
              <div style={styles.ticketLogo}>
                <span style={styles.logoSho}>sho</span><span style={styles.logoHoz}>hoz</span>
              </div>
            </div>

            <div style={styles.ticketDottedDivider}></div>

            <div style={styles.ticketBody}>
              <h3 style={styles.ticketSectionTitle}>Digital Ticket / Receipt</h3>
              <div style={styles.ticketGrid}>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Booking ID:</span>
                  <span style={styles.ticketVal}>#SB-{bookingDetails?.id || '98734'}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Passenger:</span>
                  <span style={styles.ticketVal}>{name}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Mobile:</span>
                  <span style={styles.ticketVal}>{phone}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Gender:</span>
                  <span style={styles.ticketVal}>{gender}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Bus Operator:</span>
                  <span style={styles.ticketVal}>{route.busName}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Route:</span>
                  <span style={styles.ticketVal}>{route.from} → {route.to}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Journey Date:</span>
                  <span style={styles.ticketVal}>{date}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Timings:</span>
                  <span style={styles.ticketVal}>{route.departureTime} - {route.arrivalTime}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Boarding Point:</span>
                  <span style={styles.ticketVal}>{boarding}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Dropping Point:</span>
                  <span style={styles.ticketVal}>{dropping}</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Seat Number(s):</span>
                  <span style={{...styles.ticketVal, color: '#00a75a'}}>{seats} ({seatCount} seats)</span>
                </div>
                <div style={styles.ticketItem}>
                  <span style={styles.ticketLabel}>Payment Status:</span>
                  <span style={styles.paidBadge}>PAID via {paymentMethod.toUpperCase()}</span>
                </div>
              </div>

              <div style={styles.fareBreakdown}>
                <div style={styles.fareRow}>
                  <span>Seat Fare:</span>
                  <span>৳{ticketFare}</span>
                </div>
                <div style={styles.fareRow}>
                  <span>Processing Fee:</span>
                  <span>৳{processingFee}</span>
                </div>
                <div style={{...styles.fareRow, fontWeight: '800', borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '8px', color: '#e63946', fontSize: '18px'}}>
                  <span>Total Amount Paid:</span>
                  <span>৳{grandTotal}</span>
                </div>
              </div>

              {/* Barcode graphic using pure CSS */}
              <div style={styles.barcodeWrapper}>
                <div style={styles.barcodeLines}>
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 3, 2, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                    <div key={idx} style={{width: `${w}px`, background: '#1e293b', height: '40px', marginRight: '2px'}}></div>
                  ))}
                </div>
                <span style={styles.barcodeText}>*SB-{bookingDetails?.id * 978 || '7823908'}*</span>
              </div>
            </div>

            <div style={styles.ticketFooter}>
              <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Print Ticket</button>
              <button style={styles.backHomeBtn} onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* Left: Passenger and Payment Info Form */}
            <div style={styles.formContainer}>
              <form onSubmit={handleBooking}>
                {/* Passenger Info Card */}
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Passenger Details</h3>
                  <div style={styles.formGrid}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Passenger Name</label>
                      <input 
                        style={styles.input} 
                        type="text" 
                        placeholder="e.g. Abul Kalam"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>Mobile Number</label>
                      <input 
                        style={styles.input} 
                        type="tel" 
                        placeholder="e.g. 01712345678"
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>Email Address</label>
                      <input 
                        style={styles.input} 
                        type="email" 
                        placeholder="e.g. abul@gmail.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.label}>Gender</label>
                      <div style={styles.genderRow}>
                        {['Male', 'Female', 'Other'].map(g => (
                          <label key={g} style={styles.radioLabel}>
                            <input 
                              type="radio" 
                              name="gender" 
                              value={g} 
                              checked={gender === g} 
                              onChange={() => setGender(g)} 
                              style={styles.radio}
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Payment Card */}
                <div style={{...styles.card, marginTop: '24px'}}>
                  <h3 style={styles.cardTitle}>Payment Method</h3>
                  <div style={styles.paymentSelectorRow}>
                    <div 
                      style={paymentMethod === 'bkash' ? styles.paymentOptionActive : styles.paymentOption}
                      onClick={() => setPaymentMethod('bkash')}
                    >
                      <span style={styles.paymentLogo}>bKash</span>
                    </div>
                    <div 
                      style={paymentMethod === 'nagad' ? styles.paymentOptionActive : styles.paymentOption}
                      onClick={() => setPaymentMethod('nagad')}
                    >
                      <span style={styles.paymentLogo}>Nagad</span>
                    </div>
                    <div 
                      style={paymentMethod === 'rocket' ? styles.paymentOptionActive : styles.paymentOption}
                      onClick={() => setPaymentMethod('rocket')}
                    >
                      <span style={styles.paymentLogo}>Rocket</span>
                    </div>
                    <div 
                      style={paymentMethod === 'card' ? styles.paymentOptionActive : styles.paymentOption}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <span style={styles.paymentLogo}>Card</span>
                    </div>
                  </div>

                  <div style={styles.paymentFieldsBox}>
                    {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') ? (
                      <div style={styles.mfsFields}>
                        <p style={styles.paymentInstructions}>
                          Enter your registered <strong>{paymentMethod}</strong> number and verification code below to process mock booking payment.
                        </p>
                        <div style={styles.formGrid}>
                          <div style={styles.formField}>
                            <label style={styles.label}>{paymentMethod.toUpperCase()} Number</label>
                            <input 
                              style={styles.input} 
                              type="text" 
                              placeholder="01xxxxxxxxx"
                              value={paymentPhone} 
                              onChange={(e) => setPaymentPhone(e.target.value)} 
                              required 
                            />
                          </div>
                          <div style={styles.formField}>
                            <label style={styles.label}>Verification OTP</label>
                            <input 
                              style={styles.input} 
                              type="password" 
                              placeholder="e.g. 123456 (Mock)" 
                              value={paymentOtp} 
                              onChange={(e) => setPaymentOtp(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.cardFields}>
                        <p style={styles.paymentInstructions}>
                          Enter card details to process payment. Use any fake/mock details.
                        </p>
                        <div style={styles.formField}>
                          <label style={styles.label}>Card Number</label>
                          <input 
                            style={styles.input} 
                            type="text" 
                            placeholder="xxxx xxxx xxxx xxxx" 
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)} 
                            required 
                          />
                        </div>
                        <div style={styles.formGrid}>
                          <div style={styles.formField}>
                            <label style={styles.label}>Expiry Date</label>
                            <input 
                              style={styles.input} 
                              type="text" 
                              placeholder="MM/YY" 
                              value={cardExpiry} 
                              onChange={(e) => setCardExpiry(e.target.value)} 
                              required 
                            />
                          </div>
                          <div style={styles.formField}>
                            <label style={styles.label}>CVV</label>
                            <input 
                              style={styles.input} 
                              type="password" 
                              placeholder="xxx" 
                              value={cardCvv} 
                              onChange={(e) => setCardCvv(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <button type="submit" style={styles.confirmBtn}>
                  Confirm Ticket Booking (Pay ৳{grandTotal})
                </button>
              </form>
            </div>

            {/* Right: Detailed Ticket Summary Card */}
            <div style={styles.summaryContainer}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Journey Summary</h3>
                <div style={styles.summaryList}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Bus Operator</span>
                    <span style={styles.summaryVal}>{route.busName}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Route</span>
                    <span style={styles.summaryVal}>{route.from} → {route.to}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Journey Date</span>
                    <span style={styles.summaryVal}>{date}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Departure Time</span>
                    <span style={styles.summaryVal}>{route.departureTime}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Arrival Time</span>
                    <span style={styles.summaryVal}>{route.arrivalTime}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Boarding Point</span>
                    <span style={styles.summaryVal}>{boarding}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Dropping Point</span>
                    <span style={styles.summaryVal}>{dropping}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Seat Numbers</span>
                    <span style={{...styles.summaryVal, color: '#00a75a'}}>{seats}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Seat Count</span>
                    <span style={styles.summaryVal}>{seatCount}</span>
                  </div>
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.pricingSection}>
                  <div style={styles.priceRow}>
                    <span>Base Ticket Fare ({seatCount} seats)</span>
                    <span>৳{ticketFare}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Processing Fee</span>
                    <span>৳{processingFee}</span>
                  </div>
                  <div style={styles.totalPriceRow}>
                    <span>Total Amount</span>
                    <span>৳{grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
  message: { color: '#475569', fontSize: '16px', textAlign: 'center', marginTop: '100px' },

  content: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px' },
  layout: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
  formContainer: { flex: 1, minWidth: '320px' },
  summaryContainer: { width: '360px', flexShrink: 0 },

  card: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', color: '#1e293b', fontSize: '14px', outline: 'none', transition: 'border 0.2s' },
  genderRow: { display: 'flex', gap: '16px', height: '42px', alignItems: 'center' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#475569', cursor: 'pointer' },
  radio: { width: '16px', height: '16px', accentColor: '#00a75a' },

  paymentSelectorRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  paymentOption: { flex: 1, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  paymentOptionActive: { flex: 1, background: '#00a75a', border: '1px solid #00a75a', borderRadius: '6px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', color: '#ffffff', boxShadow: '0 4px 6px rgba(0, 167, 90, 0.2)' },
  paymentLogo: { fontSize: '14px', fontWeight: '700' },
  paymentFieldsBox: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' },
  paymentInstructions: { fontSize: '13px', color: '#64748b', marginBottom: '14px', lineHeight: '1.5' },

  errorBox: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginTop: '20px' },
  confirmBtn: { width: '100%', background: '#e63946', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginTop: '24px', transition: 'background 0.2s', outline: 'none' },

  summaryList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px' },
  summaryLabel: { color: '#64748b', fontWeight: '500' },
  summaryVal: { color: '#1e293b', fontWeight: '700' },
  summaryDivider: { height: '1px', background: '#cbd5e1', margin: '20px 0' },
  pricingSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' },
  totalPriceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#e63946', marginTop: '6px' },

  ticketBox: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' },
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
  fareBreakdown: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  fareRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' },
  barcodeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' },
  barcodeLines: { display: 'flex', justifyContent: 'center' },
  barcodeText: { fontSize: '12px', color: '#64748b', marginTop: '6px', letterSpacing: '2px' },
  ticketFooter: { background: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '20px 24px', display: 'flex', gap: '16px', justifyContent: 'flex-end' },
  printBtn: { background: 'transparent', color: '#00a75a', border: '1px solid #00a75a', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  backHomeBtn: { background: '#00a75a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }
}

export default BookingPage