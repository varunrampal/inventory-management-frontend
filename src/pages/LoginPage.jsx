import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


// const BASE_URL = import.meta.env.PROD
//   ? 'https://inventory-management-server-vue1.onrender.com'
//   : 'http://localhost:4000';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
   const { setUser } = useAuth();  
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await fetch(`${BASE_URL}/admin/login`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password })
  //     });
  //     if (!res.ok) throw new Error('Login failed');
  //     const data = await res.json();
  //     localStorage.setItem('token', data.token);
  //     navigate('/dashboard');
  //   } catch (err) {
  //     setError('Invalid email or password');
  //   }
  // };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      const roles = Array.isArray(data.user?.roles) ? data.user.roles : [];
      let dest = '/dashboard';
       if (roles.includes('supervisor')) dest = '/time-sheet';
    // optionally, send employees to timesheet too:
    // else if (roles.includes('employee')) dest = '/time-sheet';

    navigate(dest, { replace: true });
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

    // <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
    //   <h2 className="text-xl mb-4">Login</h2>
    //   {error && <p className="text-red-500">{error}</p>}
    //   <input
    //     type="email"
    //     placeholder="Email"
    //     value={email}
    //     onChange={e => setEmail(e.target.value)}
    //     className="border p-2 w-full mb-2"
    //     required
    //   />
    //   <input
    //     type="password"
    //     placeholder="Password"
    //     value={password}
    //     onChange={e => setPassword(e.target.value)}
    //     className="border p-2 w-full mb-2"
    //     required
    //   />
    //   <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    // </form>
    <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-gray-400 shadow rounded-lg flex justify-center items-center overflow-hidden">
        {/* Logo in top-right corner */}
        {/* <img
          src={logo}
          alt="Logo"
          className="absolute top-4 right-4 h-10 w-auto opacity-90"
        /> */}
        {/* Left: Login form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-orange-500">Inv</span>
              <span className="text-white">Track</span>
            </h1>
            <h2 className="text-lg font-bold mb-6 text-left">Sign In</h2>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* <label className="block mb-2 text-sm font-medium">Email</label> */}
            <input
              type="email"
              className="w-full mb-4 p-2 border rounded"
              value={email}
              placeholder='Email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* <label className="block mb-2 text-sm font-medium">Password</label> */}
            <input
              type="password"
              className="w-full mb-4 p-2 border rounded"
              value={password}
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>

        {/* Right: Logo image */}
        {/* <div className="hidden md:block md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
          <img src={logo} alt="Logo" className="max-w-full h-auto opacity-90" />
        </div> */}
      </div>
    </div>


  );
}
