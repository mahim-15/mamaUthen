import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5047/api/Auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={styles.container}>
      {/* Left Side */}
      <div style={styles.left}>
        <DotLottieReact src="/bus.json" loop autoplay style={{width:'80%', height:'400px'}} />
        <h2 style={styles.leftText}>Mama pichone jaiga ase <span style={styles.red}>Uthen</span></h2>
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <h1 style={styles.logo}>Mama<span style={styles.red}>Uthen</span></h1>

        <h2 style={styles.welcome}>Welcome</h2>
        <p style={styles.sub}>Login to your <span style={styles.red}>MamaUthen</span> account</p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email *</label>
          <input
            style={styles.input}
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password *</label>
          <div style={styles.passWrapper}>
            <input
              style={{...styles.input, paddingRight: '40px'}}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
              {showPass ? '🙈' : '👁'}
            </span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.loginBtn} onClick={handleLogin}>Log In</button>

        <p style={styles.register}>
          Don't have an account?{' '}
          <span style={styles.link} onClick={() => navigate('/register')}>Create Account</span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0a0a0a' },
  left: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', borderRight: '1px solid #1a1a1a' },
  leftText: { color: '#fff', fontSize: '28px', fontWeight: '800', marginTop: '20px' },
  right: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px' },
  logo: { fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '40px' },
  welcome: { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' },
  sub: { color: '#aaa', fontSize: '15px', marginBottom: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { color: '#fff', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '14px 16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  passWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px' },
  error: { color: '#e63946', fontSize: '14px', marginBottom: '12px' },
  loginBtn: { width: '100%', background: '#e63946', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' },
  register: { color: '#aaa', fontSize: '14px', textAlign: 'center' },
  link: { color: '#e63946', fontWeight: '700', cursor: 'pointer' },
  red: { color: '#e63946' },
}

export default Login