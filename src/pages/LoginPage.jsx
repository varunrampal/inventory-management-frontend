import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // const handleLogin = async () => {
  //   console.log(BASE_URL);
  //   const res = await fetch(`${BASE_URL}/admin/login`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     credentials: 'include',
  //     body: JSON.stringify({ email, password })
  //   });

  //   if (res.ok) {
  //     navigate('/dashboard');
  //   } else {
  //     setError('Invalid email or password');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };



  return (

    // <div className="p-6 max-w-md mx-auto mt-20">
    //   <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
    //   {error && <p className="text-red-600 mb-2">{error}</p>}
    //   <input
    //     className="block mb-2 border p-2 w-full"
    //     placeholder="Email"
    //     value={email}
    //     onChange={e => setEmail(e.target.value)}
    //   />
    //   <input
    //     className="block mb-4 border p-2 w-full"
    //     type="password"
    //     placeholder="Password"
    //     value={password}
    //     onChange={e => setPassword(e.target.value)}
    //   />
    //   <button
    //     onClick={handleLogin}
    //     className="bg-blue-600 text-white px-4 py-2 rounded w-full"
    //   >
    //     Login
    //   </button>
    // </div>

    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-2"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>


  );
}
