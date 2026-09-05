import './App.css'
import CartProvider from './cart/CartProvider'
import Header from './components/Header/Header'
import Menu from './Menu'
import Sidebar from './components/main/Sidebar/Sidebar'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <CartProvider>
      <div className="layout">
        <Header />
        <main className="main">
          <Menu />
        </main>
        <aside className="aside">
          <Sidebar />
        </aside>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App
