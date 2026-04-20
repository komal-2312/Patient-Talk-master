import { useNavigate, useParams } from 'react-router-dom'

const HOSPITAL_COPY = {
  'boston-memorial': {
    name: 'Boston Memorial Hospital',
    tagline: 'Compassionate care, advanced medicine.',
  },
  'saint-marys': {
    name: 'Saint Mary\'s Hospital',
    tagline: 'Serving the community with heart.',
  },
  'city-general': {
    name: 'City General Hospital',
    tagline: 'Your health, our priority.',
  },
}

export default function HospitalLanding() {
  const navigate = useNavigate()
  const { hospitalId } = useParams()

  const hospital = HOSPITAL_COPY[hospitalId] ?? {
    name: 'Hospital',
    tagline: 'Share your experience with us.',
  }

  return (
    <div className="screen">
      <header className="header header--top">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
        <button
          type="button"
          className="link-button"
          onClick={() => navigate('/')}
        >
          Change Hospital
        </button>
      </header>

      <main className="panel panel--wide">
        <section className="hero">
          <div className="hero-text">
            <h1 className="panel-title">{hospital.name}</h1>
            <p className="panel-subtitle">{hospital.tagline}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(`/hospital/${hospitalId}/feedback`)}
            >
              Fill Feedback Form
            </button>
          </div>

          <div className="hero-gallery">
            {/* Placeholder tiles to mimic the image grid from Figma */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="hero-card">
                <span className="hero-card-label">Department {index + 1}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}


