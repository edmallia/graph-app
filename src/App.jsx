import './App.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import GraphLayoutFlow from './GraphLayoutFlow';
import { loader as graphLoader } from './GraphLayoutFlow';

import Assets from './Assets';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Assets/>,
  },
  {
    path: "/graph/:assetName",
    element: <GraphLayoutFlow/>,
    loader: graphLoader
  }
]);


export default function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
