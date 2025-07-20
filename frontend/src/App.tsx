import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayPage } from './pages/PlayPage';
import { HomePage } from './pages/HomePage';
import { SoundToggle } from './components/SoundToggle';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
        </Routes>
        <SoundToggle />
      </div>
    </Router>
  );
}

export default App;