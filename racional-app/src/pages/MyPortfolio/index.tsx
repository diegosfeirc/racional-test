import InvestmentChart from '../../components/InvestmentChart/index';
import RiskChart from '../../components/RiskChart/index';
import logo from '../../assets/racional-black.svg';
import './styles.css';

function MyPortfolio() {
  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <img src={logo} alt="Racional" className="portfolio-logo" />
      </div>
      <div className="portfolio-content">
        <InvestmentChart />
        <RiskChart />
      </div>
    </div>
  );
}

export default MyPortfolio;

