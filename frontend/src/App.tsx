import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Discover from './pages/Discover';
import Activities from './pages/Activities';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<Layout />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
