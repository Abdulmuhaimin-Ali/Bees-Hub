import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Discover from './pages/Discover';
import Activities from './pages/Activities';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Discover />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}