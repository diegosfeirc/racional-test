import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import Evolution from './pages/Evolution';
import Returns from './pages/Returns';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/evolution" element={<Evolution />} />
        <Route path="/returns" element={<Returns />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
