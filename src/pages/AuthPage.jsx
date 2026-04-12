import Register from "./Register";
import "./AuthPage.css";

export default function AuthPage() {
  return (
    <div className="auth-container">
      
      {/* LEFT → Register */}
      <div className="left-card">
        <Register />
      </div>

      {/* RIGHT → Your Existing Card */}
      <div className="right-card">
        <div className="parent">
          <div className="card">
            <div className="logo">
              <span className="circle circle1"></span>
              <span className="circle circle2"></span>
              <span className="circle circle3"></span>
              <span className="circle circle4"></span>
              <span className="circle circle5"></span>
            </div>

            <div className="glass"></div>

            <div className="content">
              <span className="title">Welcome Back</span>
              <span className="text">
                Create account or explore platform
              </span>
            </div>

            <div className="bottom">
              <div className="view-more">
                <button className="view-more-button">Explore</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}