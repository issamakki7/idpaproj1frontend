import { Route, Routes } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Home from "../pages/Home/Home";
import Navbar from "../components/Navbar/Navbar";
import NotFound404 from "../components/NotFound404/NotFound404";
import DiffPage from "../pages/DiffPage/DiffPage";
import SearchPage from "../pages/SearchPage/SearchPage";
import ClusterPage from "../pages/ClusterPage/ClusterPage";


function RouterProvider() {

  return (
    <div className="content">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diff" element={<DiffPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cluster" element={<ClusterPage />} />


        <Route path="/*" element={<NotFound404 />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default RouterProvider;