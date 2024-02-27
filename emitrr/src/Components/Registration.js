import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from '../state/index';
import { Link } from 'react-router-dom';

export default function Registration() {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const card = useSelector((state) => state.card);
  const action = bindActionCreators(actionCreators, dispatch);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(card)

    try {
      const response = await fetch('http://localhost:8080/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });
      if (response.ok) {
        // Handle success, maybe redirect or perform other actions
        console.log('Form data sent successfully');
      } else {
        // Handle error
        console.error('Failed to send form data');
      }
    } catch (error) {
      console.error('Error sending form data:', error);
    }
  };

  function handleuser() {
    action.userRegistration(username);
  }

  function handleChange(event) {
    setUsername(event.target.value);
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter Your Name:</label>
        <input type='text' name='username' onChange={handleChange}></input>
        <button className="btn btn-primary" onClick={handleuser} >Submit</button>
      </form>
      <Link to='/MainApp'><button className="btn btn-primary" >Start Game</button></Link>
    </div>
  );
}
