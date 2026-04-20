import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="top-menu">
      <button
        type="button"
        className="menu-button"
        aria-label="Menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        ☰
      </button>
      {open && (
        <div className="menu-dropdown">
          <button
            type="button"
            className="menu-item"
            onClick={() => handleNavigate('/theme')}
          >
            Theme
          </button>
          <button
            type="button"
            className="menu-item"
            onClick={() => handleNavigate('/admin/responses')}
          >
            View Responses
          </button>
          <button
            type="button"
            className="menu-item"
            onClick={() => handleNavigate('/')}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}



