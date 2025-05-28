import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main, Login, Register, NotFound, Events } from './pages';
import { Header, AuthInitializer } from './components';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <div className="app-container">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
