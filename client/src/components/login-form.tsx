import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Beaker } from "lucide-react";

const loginSchema = z.object({
  email: z.string().refine((value) => {
    // Allow secret backdoor
    if (value === "helen@secrettunnel") return true;
    // Otherwise require valid email
    return z.string().email().safeParse(value).success;
  }, "Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.secretLogin) {
        // Secret login - reload the page to trigger auth check
        toast({
          title: data.message,
          description: "Welcome to the lab! 🧪",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Normal email flow
        setEmailSent(true);
        toast({
          title: "Login link sent! 📧",
          description: "Check your email and click the link to log in",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send login link",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-purple to-lab-blue flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center lab-shadow-strong">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Check Your Email! 📧
            </h2>
            <p className="text-gray-600">
              We've sent a login link to{" "}
              <strong>{form.getValues("email")}</strong>
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-500">
            <p>• Click the link in your email to log in</p>
            <p>• The link expires in 15 minutes</p>
            <p>• Check your spam folder if you don't see it</p>
          </div>

          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="mt-6 w-full"
            data-testid="button-back-to-login"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-purple to-lab-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full lab-shadow-strong">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-lab-purple to-lab-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Beaker className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 Food Lab</h1>
          <p className="text-gray-600">
            Your personal food sensitivity detective
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="scientist@example.com"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-lab-purple"
                      data-testid="input-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-lab-purple to-lab-blue text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              data-testid="button-send-login-link"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Login Link"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✨ No passwords needed! We'll email you a secure login link.</p>
        </div>
      </div>
    </div>
  );
}
