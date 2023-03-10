import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, escrow, togglepop }) => {

    return (
        <div className="home">
        <div className='home__details'>
            <div className='home__image'>
                <img src={home.image} alt="home"></img>
            </div>
            <button onClick={togglepop} src={close} className="home__close">
                <img src={close} alt="Close"></img>
            </button>
        </div>
        </div>
    );
}

export default Home;
