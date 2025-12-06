import { useNavigate } from 'react-router-dom';
import './styles.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-text-section">
          <h1 className="landing-title">
            La forma más fácil de ahorrar e invertir
          </h1>
          <p className="landing-description">
            Invierte en empresas, ETFs y portafolios. ¡Revisa la evolución de tus inversiones ahora mismo!
          </p>
          <button 
            className="landing-button"
            onClick={() => navigate('/my-portfolio')}
          >
            Ir a Mi Portafolio
          </button>
        </div>
        
        <div className="landing-video-section">
          <video 
            className="landing-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source 
              src="https://racional.cl/assets/images/land-home.mp4" 
              type="video/mp4" 
            />
          </video>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

