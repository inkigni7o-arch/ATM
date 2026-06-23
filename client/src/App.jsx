import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import AdminPage from './pages/AdminPage'
import UniversitiesPage from './pages/UniversitiesPage'
import WidgetsPage from './pages/WidgetsPage'
import ContractsPage from './pages/ContractsPage'
import SozlamalarPage from './pages/SozlamalarPage'
import ProgramsPage from './pages/ProgramsPage'
import './App.css'

function MainSite() {
  return (
    <LanguageProvider>
      <Navbar />
      <main>
        <Intro />
      </main>
    </LanguageProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/universities" element={<UniversitiesPage />} />
        <Route path="/admin/widgets" element={<WidgetsPage />} />
        <Route path="/admin/contracts" element={<ContractsPage />} />
        <Route path="/admin/settings" element={<SozlamalarPage />} />
        <Route path="/admin/programs" element={<ProgramsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
