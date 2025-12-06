import React from 'react';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import logo from '../../assets/racional-black.svg';
import './styles.css';

interface NavBarSection {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  
  const sections: NavBarSection[] = [
    {
      label: 'Evolución',
      path: '/evolution',
      icon: <TrendingUpIcon className="nav-icon" />,
    },
    {
      label: 'Volatilidad',
      path: '/volatility',
      icon: <ShowChartIcon className="nav-icon" />,
    },
  ];

  const handleSectionClick = (path: string) => (): void => {
    navigate(path);
  };

  const handleLogoClick = (): void => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleLogoClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleLogoClick(); } }}>
          <img src={logo} alt="Racional" className="navbar-logo-img" />
        </div>
        
        <div className="navbar-sections">
          {sections.map((section) => (
            <button
              key={section.path}
              className="navbar-section-button"
              onClick={handleSectionClick(section.path)}
              type="button"
              aria-label={section.label}
            >
              {section.icon}
              <span className="navbar-section-label">{section.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

