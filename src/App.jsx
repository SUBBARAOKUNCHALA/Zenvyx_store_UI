import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import './App.css'

function App() {
  return (
    <>
    <Navbar/>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/product/:id" element={<ProductDetails />} />
    </Routes>
    </>
  );
}

export default App;