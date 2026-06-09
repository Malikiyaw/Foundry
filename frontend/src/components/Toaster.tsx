import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/index';
import { removeToast } from '../store/uiSlice';

export default function Toaster() {
  const toasts = useSelector((state: RootState) => state.ui.toasts);
  const dispatch = useDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm shadow-lg cursor-pointer ${
            toast.type === 'error' ? 'bg-red-600 text-white' :
            toast.type === 'success' ? 'bg-green-600 text-white' :
            'bg-[#333] text-[#ccc]'
          }`}
          onClick={() => dispatch(removeToast(toast.id))}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
