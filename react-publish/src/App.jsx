import { useState } from 'react'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      hello app
      <div>
        <button onClick={() => {setCount(count+1);}}>{count}</button>
      </div>
    </div>
  )
}

export default App
