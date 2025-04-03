import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Home from "./components/home/index";
import ListProperty from "./components/listProperty";
import MyListings from './components/MyListings';
import Favorites from "./components/Favorites";
import EditProperty from "./components/EditProperty";

import { AuthProvider } from "./contexts/authContext/index";
import { useRoutes, Navigate } from "react-router-dom";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/list-property",
      element: <ListProperty />,
    },
    {
      path: "/my-listings",
      element: <MyListings />,
    },
    {
      path: "/favorites",
      element: <Favorites />,
    },
    {
      path: "/edit-property/:propertyId",
      element: <EditProperty />,
    },
  ];

  let routesElement = useRoutes(routesArray);
  
  return (
    <AuthProvider>
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;