'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createUser, CreateUserData } from '@/lib/api/users';
import { toast } from '@/hooks/use-toast';

export default function NewUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'LAWYER',
    avatar: '',
  });

  // Only admin can access this page
  if (!user || user.role !== 'admin') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access this page. Only administrators can create new users.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const handleChange = (field: keyof CreateUserData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear password errors when user modifies password
    if (field === 'password') {
      setPasswordErrors([]);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.email || !formData.password || !formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Validate password
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      toast({
        title: 'Password Validation Failed',
        description: 'Please fix the password errors',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await createUser(formData);
      toast({
        title: 'Success',
        description: `${formData.role === 'LAWYER' ? 'Lawyer' : 'User'} created successfully`,
      });
      router.push('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle validation errors from backend
      if (error.errors && Array.isArray(error.errors)) {
        setPasswordErrors(error.errors);
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New User / Lawyer</h1>
            <p className="text-muted-foreground">Create a new user account and assign role</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Fill in the details to create a new user account. Lawyers can be assigned to cases and clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAWYER">Lawyer</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formData.role === 'LAWYER' && 'Can be assigned to cases and clients'}
                    {formData.role === 'STAFF' && 'Limited access to manage records'}
                    {formData.role === 'CLIENT' && 'Can view their own cases only'}
                    {formData.role === 'ADMIN' && 'Full system access'}
                  </p>
                </div>

                {/* Avatar URL (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={(e) => handleChange('avatar', e.target.value)}
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                  
                  {/* Password Requirements */}
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                        ✓ At least 8 characters long
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ At least one uppercase letter
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ At least one lowercase letter
                      </li>
                      <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ At least one number
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ At least one special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>

                  {/* Password Errors */}
                  {passwordErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 border-t pt-6">
                <Link href="/users">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create {formData.role === 'LAWYER' ? 'Lawyer' : 'User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
