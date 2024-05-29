import logo from '../../assets/logo.png';
import {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import './signup.css';

import {AuthContext} from '../../contexts/auth'




export default function SigIn (){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {signUp, loadingAuth} = useContext(AuthContext);

async function handleSubmit (e){

    e.preventDefault();

    if (name !== '' && email !== '' && password !== '') {
       await signUp(email, password, name)
    }

}

    return (
        <div className='container-center'>
        <div className='login'>
            <div className="login-area">
                <img src={logo} alt="logo" />
            </div>

            <form onSubmit={handleSubmit}>
                <h1>Cadastrar-se</h1>
                <input type="text" 
                placeholder='Seu nome'
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
                <input type="text" 
                placeholder='email@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <input type="password" 
                placeholder='******'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                
                <button type="submit">{loadingAuth? 'Carregando' : 'Cadastrar'}</button>

            </form>

            <Link to="/">Fazer login</Link>

        </div>
        </div>
    )

}