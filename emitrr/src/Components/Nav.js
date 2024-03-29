import React from 'react'
import { useSelector } from 'react-redux';

export default function Nav() {
  const card = useSelector((state) => state.card);
  return (
    <>
        <nav className="navbar navbar-expand-lg bg-body-dark">
        <div className="container-fluid">
            <a className="navbar-brand" href="/">Cat Exploding Card Game</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
                </li>
                <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/leaderboard">LeaderBoard</a>
                </li>
            </ul>
            <div className="d-flex" role="search">
                <p className='font-weight-bold'>USERNAME: </p>
                <p className='font-weight-bold text-uppercase'>{card.username}</p>
            </div>
            </div>
        </div>
        </nav>
    </>
  )
}
