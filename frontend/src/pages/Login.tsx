import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getRoleLanding } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Welcome back!');
        const role = user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role;
        const dest = getRoleLanding(role);
        navigate(dest);
      } else {
        toast.error('Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // quick login removed — using real backend credentials

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(217_91%_60%/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(199_89%_48%/0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg animate-pulse-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">GearGuard</span>
          </div>
          
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 leading-tight">
            Equipment Maintenance<br />
            <span className="text-gradient">Management System</span>
          </h1>
          
          <p className="text-lg text-primary-foreground/70 mb-8 max-w-md">
            Streamline your maintenance operations with intelligent tracking, 
            team assignment, and preventive maintenance scheduling.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-sidebar-accent/50 rounded-xl p-4 backdrop-blur">
              <p className="text-2xl font-bold text-primary-foreground">98%</p>
              <p className="text-sm text-primary-foreground/60">Uptime</p>
            </div>
            <div className="bg-sidebar-accent/50 rounded-xl p-4 backdrop-blur">
              <p className="text-2xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/60">Equipment Tracked</p>
            </div>
            <div className="bg-sidebar-accent/50 rounded-xl p-4 backdrop-blur">
              <p className="text-2xl font-bold text-primary-foreground">24h</p>
              <p className="text-sm text-primary-foreground/60">Avg Response</p>
            </div>
            <div className="bg-sidebar-accent/50 rounded-xl p-4 backdrop-blur">
              <p className="text-2xl font-bold text-primary-foreground">15+</p>
              <p className="text-sm text-primary-foreground/60">Technicians</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">GearGuard</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="gradient"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Don’t have an account?</span>{' '}
            <Link to="/register" className="text-primary-foreground font-medium hover:underline">Create account</Link>
          </div>

          
        </div>
      </div>
    </div>
  );
}
