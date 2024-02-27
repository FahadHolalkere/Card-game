import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const LeaderBoard = () => {
    const card = useSelector(state => state.card)
  const [leaderboard, setLeaderboard] = useState([card]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/leaderboard');
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Leaderboard</h2>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Username</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => (
            <tr key={index}>
              {user.gamestate.leaderboard.map((leader,id) => (
                <>
                <td key={id}>{leader.username}</td>
                <td>{leader.points}</td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderBoard;

