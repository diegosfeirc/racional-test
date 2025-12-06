import React from 'react';
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
  const sections: NavBarSection[] = [
    {
      label: 'Evolución',
      path: '/my-portfolio',
      icon: <TrendingUpIcon className="nav-icon" />,
    },
    {
      label: 'Volatilidad',
      path: '/volatility',
      icon: <ShowChartIcon className="nav-icon" />,
    },
  ];

  const handleSectionClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    // Por ahora no hace nada, como solicitaste
    e.preventDefault();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Racional" className="navbar-logo-img" />
        </div>
        
        <div className="navbar-sections">
          {sections.map((section) => (
            <button
              key={section.path}
              className="navbar-section-button"
              onClick={handleSectionClick}
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

