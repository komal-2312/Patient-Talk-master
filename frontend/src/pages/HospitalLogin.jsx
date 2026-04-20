import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HospitalLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ hospitalCode: '', password: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: hook with backend hospital login
    navigate('/complaints')
  }

  return (
    <div className="screen screen--centered">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--narrow">
        <h1 className="panel-title">Hospital Login</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              Hospital ID / Code
              <input
                required
                type="text"
                name="hospitalCode"
                className="input"
                value={form.hospitalCode}
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
                value={form.password}
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


