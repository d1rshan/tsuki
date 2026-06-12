import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm border-border/50">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to AniLog</CardTitle>
            <CardDescription className="text-center">
              Log your favorite anime and share reviews.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
