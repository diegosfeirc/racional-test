import InvestmentChart from '../../components/InvestmentChart/index';
import './styles.css';

function MyPortfolio() {
  return (
    <div className="portfolio-container">
      <div className="portfolio-content">
        <InvestmentChart />
      </div>
    </div>
  );
}

export default MyPortfolio;

