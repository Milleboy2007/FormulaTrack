import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/profil' element={<Profil />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/jeu' element={<Jeu />} />
      </Routes>
    </>
  )
}

export default App
