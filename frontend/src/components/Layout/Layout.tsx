import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoginDestinationModal from '../LoginDestinationModal';
import { RootState } from '../../store';
import { promptLoginDestination } from '../../store/uiSlice';

const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const { showLoginDestinationModal, viewModeChosen } = useSelector((s: RootState) => s.ui);

  useEffect(() => {
    if (user && user.role !== 'EMPLOYEE' && !viewModeChosen) {
      dispatch(promptLoginDestination());
    }
  }, [user, viewModeChosen, dispatch]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
      {showLoginDestinationModal && user?.role !== 'EMPLOYEE' && <LoginDestinationModal />}
    </div>
  );
};

export default Layout;
