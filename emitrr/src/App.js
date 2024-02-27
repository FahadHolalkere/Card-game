
import { Provider } from 'react-redux';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from './Components/Registration';
import { store } from './state/store';
import MainApp from './Components/MainApp';
import Nav from './Components/Nav';
import LeaderBoard from './Components/LeaderBoard';

function App() {
  return (
      <Provider store={store}>
        <Nav/>
        <BrowserRouter>
          <Routes>
            <Route index element={<Registration />} />
            <Route path="MainApp" element={<MainApp />} />
            <Route path="leaderBoard" element={<LeaderBoard />} />
          </Routes>
        </BrowserRouter>
      </Provider>
  );
}

export default App;
