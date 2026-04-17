import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
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
      <Route path="/cart" element={<Cart />} />
      <Route path="/address" element={<Address />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-orders" element={<MyOrders />} />
    </Routes>
    </>
  );
}

export default App;