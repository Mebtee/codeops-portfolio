import './Layout.css';
import { Outlet } from 'react-router-dom';
import Header from './Component/Header/Header';
import Footer from './Component/Footer/Footer';

function Layout() {
  return (
    <div className="main-layout">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;
