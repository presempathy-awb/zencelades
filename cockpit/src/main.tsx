import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { Tooltip } from "radix-ui";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";

const rootRoute = createRootRoute({ component: App, notFoundComponent: App });
const routes = ["/", "/model", "/workflow", "/tasks", "/budget", "/parts", "/research"].map(
  (path) => createRoute({ getParentRoute: () => rootRoute, path }),
);
const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  history: createHashHistory(),
});
const queryClient = new QueryClient();
const root = document.getElementById("root");
if (!root) throw new Error("Studio root is missing");
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={300}>
        <RouterProvider router={router} />
      </Tooltip.Provider>
    </QueryClientProvider>
  </StrictMode>,
);
