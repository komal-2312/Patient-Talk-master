import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: hook with backend auth route
    navigate('/super-admin/dashboard')
  }

  return (
    <div className="screen screen--centered">
      <header className="header">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--narrow">
        <h1 className="panel-title">Super Admin</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              Email
              <input
                required
                type="email"
                name="email"
                className="input"
                value={credentials.email}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              Password
              <input
                required
                type="password"
                name="password"
                className="input"
                value={credentials.password}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--full">
              Login
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


