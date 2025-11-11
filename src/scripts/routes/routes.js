import HomePage from "../pages/home/home-page";
import StoriesPage from "../pages/stories/stories-page";
import AddStoryPage from "../pages/stories/add-story-page";
import DetailStoryPage from "../pages/stories/detail-story-page";
import FavoritesPage from "../pages/favorites/favorites-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";

const routes = {
  "/": new HomePage(),
  "/stories": new StoriesPage(),
  "/stories/add": new AddStoryPage(),
  "/stories/:id": new DetailStoryPage(),
  "/favorites": new FavoritesPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
};

const matchRoute = (path) => {
  // First try exact match
  if (routes[path]) {
    return routes[path];
  }

  // Then try pattern matching for dynamic routes
  if (path.startsWith("/stories/") && path.split("/").length === 3) {
    return routes["/stories/:id"];
  }

  return null;
};

export { routes as default, matchRoute };