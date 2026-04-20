import { useState } from 'react'

const INITIAL_PEOPLE = [
  { id: 1, name: 'Person 1', department: '', summary: true },
  { id: 2, name: 'Person 2', department: '', summary: true },
  { id: 3, name: 'Person 3', department: '', summary: true },
  { id: 4, name: 'Person 4', department: '', summary: true },
]

const DEPARTMENTS = ['Care Team', 'Waiting Room', 'Lab Work', 'Etc']

export default function AdminResponses() {
  const [people, setPeople] = useState(INITIAL_PEOPLE)
  const [showAdd, setShowAdd] = useState(false)
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', email: '' })

  const handleDeptChange = (id, department) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, department } : p)),
    )
  }

  const handleDelete = (id) => {
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newPerson.name.trim()) return
    const nextId = (people[people.length - 1]?.id || 0) + 1
    setPeople((prev) => [
      ...prev,
      { id: nextId, name: newPerson.name.trim(), department: '', summary: true },
    ])
    setNewPerson({ name: '', phone: '', email: '' })
    setShowAdd(false)
  }

  return (
    <div className="screen">
      <header className="header">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--wide responses-panel">
        <h1 className="panel-title" style={{ textAlign: 'center' }}>
          VIEW RESPONSES
        </h1>

        <div className="responses-header-row">
          <span>Department</span>
          <span>View Summary</span>
        </div>

        <div className="responses-list">
          {people.map((person) => (
            <div key={person.id} className="responses-row">
              <span className="responses-name">{person.name}</span>
              <select
                className="responses-dept-select"
                value={person.department}
                onChange={(e) => handleDeptChange(person.id, e.target.value)}
              >
                <option value="">Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="responses-check">✔</span>
              <button
                type="button"
                className="icon-button"
                aria-label="Delete person"
                onClick={() => handleDelete(person.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary btn--full"
            onClick={() => setShowAdd(true)}
          >
            Add Person
          </button>
        </div>

        <button type="button" className="btn btn--danger btn--full responses-delete-all">
          🗑 Delete Responses
        </button>

        {showAdd && (
          <div className="responses-add-card">
            <form className="form" onSubmit={handleAdd}>
              <input
                type="text"
                className="input"
                placeholder="Enter Name"
                value={newPerson.name}
                onChange={(e) =>
                  setNewPerson((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="tel"
                className="input"
                placeholder="Enter Mobile Number"
                value={newPerson.phone}
                onChange={(e) =>
                  setNewPerson((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <input
                type="email"
                className="input"
                placeholder="Enter Email Id"
                value={newPerson.email}
                onChange={(e) =>
                  setNewPerson((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <div className="form-actions">
                <button type="submit" className="btn btn--primary btn--full">
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

