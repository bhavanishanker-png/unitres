import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link } from 'react-router-dom';
import { fetchMenuItems } from '../store/menuSlice';
import { logout } from '../store/authSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.auth);
  const [uniqueItems, setUniqueItems] = useState([]);

  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  useEffect(() => {
    const filteredItems = Array.from(new Set(items.map((item) => item.path))).map(
      (path) => items.find((item) => item.path === path)
    );
    setUniqueItems(filteredItems);
  }, [items]);
  console.log(items)

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          {uniqueItems.map((item, index) => (
            <Link
              key={`${item.path}-${index}`}
              to={item.path}
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <p className="text-sm text-gray-600">
            Logged in as: {user?.username || 'Guest'}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
