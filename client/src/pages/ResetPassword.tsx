import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const searchParams = new URLSearchParams(useSearch());
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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

    if (!token) {
      setError("Token de recuperação inválido");
      return;
    }

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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao redefinir senha");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Link Inválido</CardTitle>
            <CardDescription className="text-center text-gray-400">
              O link de recuperação de senha é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/forgot-password">
              <a className="text-blue-400 hover:text-blue-300">
                Solicitar novo link
              </a>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              RX NATION
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Redefinir Senha</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Digite sua nova senha
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
                <Label htmlFor="password" className="text-gray-200">Nova Senha</Label>
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
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Nova Senha</Label>
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
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
              
              <Link href="/login">
                <a className="text-sm text-gray-400 hover:text-gray-300 text-center block">
                  Voltar para login
                </a>
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <Alert className="bg-green-900/20 border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Senha redefinida com sucesso! Você será redirecionado para o login...
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
