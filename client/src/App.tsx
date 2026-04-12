import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { FlightList } from './pages/FlightList';
import { FlightDetail } from './pages/FlightDetail';
import { Pay } from './pages/Pay';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';
import { Monitors } from './pages/Monitors';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/flights" element={<FlightList />} />
        <Route path="/flights/:id" element={<FlightDetail />} />
        <Route path="/orders/:id/pay" element={<Pay />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/me" element={<Profile />} />
        <Route path="/me/monitors" element={<Monitors />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
