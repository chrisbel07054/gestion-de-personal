import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter.jsx';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <ToastContainer position="top-center" autoClose={1200} hideProgressBar closeOnClick pauseOnHover={false} draggable={false} />
    </BrowserRouter>
  );
}

export default App
