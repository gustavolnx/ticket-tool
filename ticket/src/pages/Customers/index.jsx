import Header from '../../components/Header';
import Title from '../../components/Title';
import {FiUser} from 'react-icons/fi'
import {useState} from 'react'
import{db} from '../../services/firebaseConnection'
import {addDoc, collection} from 'firebase/firestore'
import { toast } from 'react-toastify';



export default function Customers(){

    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');

    async function handleRegister(e){
        e.preventDefault();

        if (nome !== '' &&  endereco !== '') {
            await addDoc(collection(db,'customers'),{
                nomeFantasia: nome,
                endereco: endereco
            })
            .then(()=>{
                setNome('');
                setEndereco('');
                toast.success('Cliente cadastrado com sucesso!')
            })
            .catch ((error)=>{
                console.log(error)
                toast.error('Erro ao cadastrar cliente')
            
            })
         
        
        }else {
            toast.error('Preencha todos os campos')
        }
       
    }
    


    return(
        <div>
            <Header/>
            <div className="content">
            <Title name="Clientes"> 
            <FiUser size={25}/>
            </Title>


            <div className="container">

            <form className='form-profile' onSubmit={handleRegister}>
                <label>Nome fantasia</label>
                <input type="text" placeholder="Nome da empresa" 
                value={nome}
                onChange={(e)=> setNome(e.target.value)}
                />
                 <label>Endereço</label>
                <input type="text" placeholder="Endereço da empresa" 
                value={endereco}
                onChange={(e)=> setEndereco(e.target.value)}
                />
                <button type="submit">Cadastrar</button>
            </form>

            </div>

            </div>
        

        </div>
    )
}