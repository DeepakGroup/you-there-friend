import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const sites = [
  { code: "NDS", name: "NDS" },
  { code: "HSD1", name: "HSD1" },
  { code: "HSD2", name: "HSD2" },
  { code: "HSD3", name: "HSD3" },
  { code: "DHJ", name: "DHJ" },
  { code: "APL", name: "APL" },
  { code: "TCD", name: "TCD" }
];

const disciplines = [
  { code: "OP", name: "Operation" },
  { code: "EG", name: "Engineering & Utility" },
  { code: "EV", name: "Environment" },
  { code: "SF", name: "Safety" },
  { code: "QA", name: "Quality" },
  { code: "OT", name: "Others" }
];

const roles = [
  { code: "INIT_LEAD", name: "Initiative Lead" },
  { code: "APPROVER", name: "Approver" },
  { code: "SITE_TSO_LEAD", name: "Site TSO Lead" },
  { code: "CORP_TSO", name: "Corp TSO" },
  { code: "SITE_CORP_TSO", name: "Site & Corp TSO" }
];

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function AuthPage({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    site: "",
    discipline: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        // Real API login
        const result = await login(formData.email, formData.password);
        console.log('Login result:', result);
        
        if (result.success) {
          console.log('Login successful in AuthPage - user should be updated');
          toast({
            title: "Login Successful",
            description: "Welcome back to OpEx Hub!",
          });
          // Clear form data after successful login
          setFormData(prev => ({ ...prev, password: '' }));
          
          // Call onLogin callback to notify parent
          if (result.user) {
            onLogin(result.user);
          }
          
          // Navigation will happen automatically via App.tsx when user state changes
        } else {
          console.log('Login failed with error:', result.error);
          toast({
            title: "Login Failed",
            description: result.error || "Invalid credentials",
            variant: "destructive"
          });
        }
      } else {
        // Real API signup
        if (!formData.fullName || !formData.site || !formData.discipline || !formData.role) {
          toast({
            title: "Signup Failed",
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return;
        }

        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          site: formData.site,
          discipline: formData.discipline,
          role: formData.role,
          roleName: roles.find(r => r.code === formData.role)?.name || ""
        };

        const result = await register(userData);
        
        if (result.success) {
          toast({
            title: "Signup Successful",
            description: "Account created successfully! Please sign in.",
          });
          setIsLogin(true); // Switch to login tab
        } else {
          toast({
            title: "Signup Failed",
            description: result.error || "Registration failed",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">OpEx Hub</h1>
                <p className="text-sm text-muted-foreground">Operational Excellence</p>
              </div>
            </div>
            <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access OpEx Hub" 
                : "Fill in your details to create your account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="login" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.lead@company.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                   <p className="text-xs text-muted-foreground">
                     Demo credentials: john.lead@company.com / password123
                   </p>
                </TabsContent>

                <TabsContent value="signup" className="space-y-3 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          className="pl-10"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.lead@company.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="site">Site *</Label>
                      <Select value={formData.site} onValueChange={(value) => handleInputChange("site", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.code} value={site.code}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discipline">Discipline *</Label>
                      <Select value={formData.discipline} onValueChange={(value) => handleInputChange("discipline", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Discipline" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplines.map((discipline) => (
                            <SelectItem key={discipline.code} value={discipline.code}>
                              {discipline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.code} value={role.code}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}