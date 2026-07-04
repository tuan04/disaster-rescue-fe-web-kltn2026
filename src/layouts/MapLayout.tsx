import { Outlet } from 'react-router-dom';

export default function MapLayout() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 text-white">
      {/* Map page renders here */}
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
}
