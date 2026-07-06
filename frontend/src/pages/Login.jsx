import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { FiMail, FiLock, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Server is starting up or unreachable. Please try again in a few seconds.');
      } else {
        toast.error(err.response.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--color-accent)] opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-500 opacity-5 blur-3xl"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-outfit gradient-text">Welcome Back</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Enter credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Username</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="eco_user" 
                className="input-field pl-10"
                {...register('usernameOrEmail', { required: 'Username or email is required' })}
              />
            </div>
            {errors.usernameOrEmail && <p className="error-text">{errors.usernameOrEmail.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="input-field pl-10 pr-10"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <FiLoader className="animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-accent)] font-semibold hover:underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
