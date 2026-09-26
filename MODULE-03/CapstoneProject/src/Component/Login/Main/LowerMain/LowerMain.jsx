import { Outlet } from 'react-router-dom';
import './LowerMain.css';

function LowerMain() {
  return (
    <div className="lower-main">
      <div className="lower-main-container">
        <div className="left-column">
          <div className="left-column-container">
            <div className="overlay">
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>
              <h1>1</h1>

            </div>
          </div>
        </div>

        <Outlet/>
      </div>
    </div>
  );
}

export default LowerMain;
