import './App.css'
import Header from './components/Header/Header'
import Menu from './components/main/Menu/Menu'
import Sidebar from './components/main/Sidebar/Sidebar'
import Footer from './components/Footer/Footer'

function App() {
  return (
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
  )
}

export default App
