
import './App.css';
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "./../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
import Jobs from './pages/jobs.js'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Inventory from './pages/Inventory.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes >
    </BrowserRouter>
  );
}

export default App;
