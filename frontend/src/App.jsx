
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import ManagePage from './pages/ManagePage';
import QuotesPage from "./pages/QuotesPage";
import PasswordGate from './components/PasswordGate';



export default function App (){
  return(
    <BrowserRouter>
    <Routes>
      {/*Ruta principala- afisare citate(read-only) */}
      <Route path="/"   element={<QuotesPage />} />
      {/*Ruta de administrare- operatiunie CRUD complete */}
      <Route path="/manage" element={
        <PasswordGate>
        <ManagePage />
        </PasswordGate>}
         />
    </Routes>
    </BrowserRouter>
  );
}
