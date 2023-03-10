import logo from '../assets/logo.svg';

const Navigation =({account,setAccount})=>{

    const connectHandler = async () =>{
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'})  
        
    setAccount(accounts[0])
    console.log(accounts[0])
    }

    return (
    <nav>
    <ul className='nav__links'>
    <li><a href='#'>Buy</a></li>
    <li><a href='#'>Sell</a></li>
    <li><a href='#'>Rent</a></li>

    </ul>

    <div className='nav__brand'>
        <img  src={logo} alt='BLF'></img>
        <h1>BLF</h1>

    </div>

    {account?(<button
    type ='button'
    className='nav__connect'>
        {account.slice(0,4)+'...'+account.slice(38,42)}
    </button> )
    :(<button
    className='nav__connect'
    type ='button'
    onClick={connectHandler}
    >
       Connect
    </button> )
    }

    

    </nav>);
}


export default Navigation;
