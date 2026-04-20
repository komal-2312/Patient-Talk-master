import { useState } from 'react'

const COLORS = [
  '#000000',
  '#ffffff',
  '#1b1a77',
  '#f5d63d',
  '#5aa7c4',
  '#f04040',
  '#7d4ae0',
  '#27c36b',
  '#26c4c4',
  '#7b7b7b',
  '#f06a4a',
  '#c9a13d',
  '#a86bd6',
]

export default function ThemeSettings() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [dark, setDark] = useState(false)
  const [font, setFont] = useState('system')

  return (
    <div className="screen screen--centered">
      <main className="panel panel--narrow">
        <div className="form">
          <div className="form-row">
            <label className="form-label">
              Font
              <select
                className="input input--select"
                value={font}
                onChange={(e) => setFont(e.target.value)}
              >
                <option value="system">Select Font</option>
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <span className="theme-label">Website color</span>
            <div className="color-row">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    selectedColor === color
                      ? 'color-dot color-dot--selected'
                      : 'color-dot'
                  }
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="form-row form-row--inline">
            <span className="theme-label">Dark theme</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={dark}
                onChange={(e) => setDark(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      </main>
    </div>
  )
}



