import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actionCreators } from '../state/index'
var cat = require('../images/catc.jpg')
var bomb = require('../images/bomb c.webp')
var defuse = require('../images/defuse.jpeg')
var shuffle = require('../images/ShuffleCard.jpg')
var back = require('../images/backcard.png')


export default function MainApp() {
    // const cards = ['cat','bomb','defuse','shuffle']
    const [cardInfo,setCardInfo] = useState([]);
    const [reset,setReset] = useState(false)
    const dispatch = useDispatch();
    const action = bindActionCreators(actionCreators ,dispatch);
    const card = useSelector(state => state.card)
    const [cards,setCards] = useState(card.gamestate)

    useEffect( () => {
      const fetchData = async () => {
        const response = await fetch('http://localhost:8080/startGame');
        const data = await response.json();
        setCards(data);
        }
        setCardInfo([])
        
      fetchData();
    },[reset])

    const handleSubmit = async () => {
      try {
        const response = await fetch('http://localhost:8080/drawCard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(card),
        });
        if (response.ok) {
          console.log('Form data sent successfully');
        } else {
          console.error('Failed to send form data');
        }
      } catch (error) {
        console.error('Error sending form data:', error);
      }
      action.resetCard(1);
      setCardInfo([])
      setReset(prev => !prev)
    };

    function handleClick(value,index) {
      setCardInfo(prev => [...prev, index])
      switch(value) {
        case "Cat" :  action.removeCard(1);
                      break;
        case "Bomb" : action.checkBomb(1);
                      break;
        case "Defuse" : action.checkDefuse(1);
                        break;
        case "Shuffle" : action.resetCard(1);
                          break;
        default : action.removeCard(1);
                  break;
      }
      setTimeout(() => {
        if(value==="Bomb" && card.gamestate.defusecard===0)
        {
          alert("That was bomb,Sorry you lost!!!")
          action.resetCard(1);
          setCardInfo([])
          setReset(prev => !prev)
        }
        else if(value==="Shuffle")
        {
          setReset(prev => !prev)
        }
        else if(cardInfo.length===4) {
          action.incrementPoint(card.username)
        }
      }, 1000);
      
      
    }
  return (
    <div >
      <div className="md-3 d-flex justify-content-evenly">
        {cards.deck.map((game, index) => 
        
        <div key={index} className="card" style={{width: 200, height: 50}}>
          {cardInfo.includes(index) ? <img  src={(() => {
                  switch (game) {
                    case 'Cat':
                      return cat;
                    case 'Bomb':
                      return bomb;
                    case 'Defuse':
                      return defuse;
                    case 'Shuffle':
                      return shuffle;
                    default:
                      return null;
                  }
                })()} className="card-img-top" alt="..." style={{weight: 100, height: 200}}/> : <img src={back} className="card-img-top" alt="..." style={{weight: 100, height: 200}} />}
          <div className="card-body">
            {cardInfo.includes(index) && <h5 className='card-title'>{game}</h5>}
            {!cardInfo.includes(index) && <button onClick={() => handleClick(game,index)} className="btn btn-primary" >Select This</button> }
          </div>
        </div>
        )}
        </div>
      <div style={{position: 'absolute' , top: 400, left: 200}}>
      <ul className='text-center'>{card.gamestate.leaderboard.map((value, index) => (
        <li key={index}>{value.username}:::====::::{value.points}</li>
      ))}</ul>
      <br></br>
      {cardInfo.length===5 && <div><p className='font-weight-bold text-uppercase'>you won</p>
      <button className="btn btn-primary" onClick={() => handleSubmit()}>Play Again</button></div>}
      <br/>
      <a href='/'><button className="btn btn-primary" onClick={() => handleSubmit()}>Exit Game</button></a>
      </div>
    </div>
  )
}
