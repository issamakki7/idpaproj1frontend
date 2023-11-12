import "./Hero.css";
import Main from "../../assets/videos/main.mp4";

function Hero() {
  return (
    <div className="hero">
      <div className="headerContainer">
        <video className="vid" autoPlay loop muted>
          <source src={Main} type="video/mp4" />
        </video>
        <h1>Find Similarity</h1>
        <p>Upload any file</p>
        <a
          href= "/diff"
        >
          <button className="btn btn--primary">Test the App</button>
        </a>
      </div>
    </div>
  );
}

export default Hero;
