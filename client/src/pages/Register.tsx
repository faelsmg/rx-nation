import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const boxSlug = searchParams.get("box");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validação de senha em tempo real
  const passwordValidation = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    match: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid = passwordValidation.minLength && 
                          passwordValidation.hasLetter && 
                          passwordValidation.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("A senha deve ter no mínimo 8 caracteres, incluindo 1 letra e 1 número");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          boxSlug 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Redirecionar para welcome
      window.location.href = data.redirectTo || "/welcome";
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
          <CardTitle className="text-2xl text-center text-white">Criar Conta</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              
              {/* Indicadores de validação */}
              {password && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center text-xs">
                    {passwordValidation.minLength ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={passwordValidation.minLength ? "text-green-400" : "text-gray-400"}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordValidation.hasLetter ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={passwordValidation.hasLetter ? "text-green-400" : "text-gray-400"}>
                      Pelo menos 1 letra
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordValidation.hasNumber ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={passwordValidation.hasNumber ? "text-green-400" : "text-gray-400"}>
                      Pelo menos 1 número
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              
              {confirmPassword && (
                <div className="flex items-center text-xs mt-1">
                  {passwordValidation.match ? (
                    <>
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-400">As senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-400">As senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={loading || !isPasswordValid || !passwordValidation.match}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              Já tem uma conta?{" "}
              <Link href="/login">
                <a className="text-blue-400 hover:text-blue-300 font-medium">
                  Fazer login
                </a>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
