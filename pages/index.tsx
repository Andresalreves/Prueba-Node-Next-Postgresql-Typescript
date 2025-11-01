import React from 'react';
import { useRouter } from 'next/router';

/**
 * Página principal de la aplicación
 * Redirige al dashboard de administración
 */
const Home: React.FC = () => {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Cargando...</h1>
        <p>Redirigiendo al panel de administración</p>
      </div>
    </div>
  );
};

export default Home;
