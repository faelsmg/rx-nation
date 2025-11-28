import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao processar solicitação");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              RX NATION
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Esqueceu a senha?</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Digite seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        
        {!success ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar instruções
                  </>
                )}
              </Button>
              
              <Link href="/login">
                <a className="flex items-center justify-center text-sm text-gray-400 hover:text-gray-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para login
                </a>
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <Alert className="bg-green-900/20 border-green-500/50">
              <Mail className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Se o email existir em nossa base de dados, você receberá instruções para redefinir sua senha.
                Verifique sua caixa de entrada e spam.
              </AlertDescription>
            </Alert>
            
            <div className="text-center pt-4">
              <Link href="/login">
                <a className="flex items-center justify-center text-sm text-blue-400 hover:text-blue-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para login
                </a>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
