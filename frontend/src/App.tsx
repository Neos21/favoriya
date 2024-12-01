import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/home/Home';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}></Route>
    </Routes>
  </BrowserRouter>
);
