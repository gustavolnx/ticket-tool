import {BrowserRouter} from 'react-router-dom'

import RoutesApp from './routes'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


import AuthProvider  from './contexts/auth'

function App() {


  return (
    <div>

    <BrowserRouter>
    <AuthProvider>
    <ToastContainer autoClose={3000}/>
    <RoutesApp/>
    </AuthProvider>
    </BrowserRouter>
 


    </div>
  );
}

export default App
