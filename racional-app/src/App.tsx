import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import MyPortfolio from './pages/MyPortfolio';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-portfolio" element={<MyPortfolio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
