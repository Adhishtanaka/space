import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { useEffect } from "react";
import Header from "./components/Headers";
import Footer from "./components/Footer";
import { AuthProvider } from "./lib/auth";
import { useTheme } from "./lib/useTheme";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Feed from "./pages/feed";
import Profile from "./pages/profile";
import MapPage from "./pages/map";

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function AppLayout() {
  const { isDark } = useTheme();

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={classNames(
      "min-h-screen flex flex-col transition-colors duration-200",
      isDark ? "bg-black" : "bg-gray-50"
    )}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "feed",
        element: <Feed />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
      {
        path: "map",
        element: <MapPage />, // Assuming MapPage is defined elsewhere
      }
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;