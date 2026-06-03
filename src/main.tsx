import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import { PublicChampionshipPage } from './pages/PublicChampionshipPage.tsx';
import { FieldMatchPage } from './pages/FieldMatchPage.tsx';
import { InviteRedeemPage } from './pages/InviteRedeemPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/p/:slug" element={<PublicChampionshipPage />} />
        <Route path="/field/:matchId" element={<FieldMatchPage />} />
        <Route path="/convite/:token" element={<InviteRedeemPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
