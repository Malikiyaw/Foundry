import React from 'react';
import { Navigate } from 'react-router-dom';

// No backend server — redirect to local gallery
export default function PublicGallery() {
  return <Navigate to="/gallery" replace />;
}
