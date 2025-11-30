import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP } from '@/components/ui/input-otp';

export default function Register() {
  const navigate = useNavigate();
  const { register, registerInternal, verifyInternal, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [type, setType] = useState<'internal' | 'external'>('internal');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Redireciona se já estiver autenticado
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/eventos" replace />;
  }

  // Validação de e-mail institucional
  const validateInstitutionalEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@aluno.iffar.edu.br');
  };

  // Valida e-mail quando tipo é interno
  useEffect(() => {
    if (type === 'internal' && email) {
      if (!validateInstitutionalEmail(email)) {
        setEmailError('E-mail deve ser do domínio @aluno.iffar.edu.br');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email, type]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'internal') {
      // Valida e-mail institucional antes de prosseguir
      if (!validateInstitutionalEmail(email)) {
        setEmailError('E-mail deve ser do domínio @aluno.iffar.edu.br');
        return;
      }
    }

    setLoading(true);

    try {
      if (type === 'internal') {
        // Registro interno: envia código por e-mail
        await registerInternal({ email, password, fullName });
        setStep('verify');
      } else {
        // Registro externo: fluxo normal
        await register({ email, password, fullName, type });
        navigate('/eventos');
      }
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (code: string) => {
    if (code.length !== 6) {
      return;
    }

    setVerifying(true);

    try {
      await verifyInternal({ email, code });
      navigate('/eventos');
    } catch (error) {
      // Erro já tratado no contexto
      setOtpCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value);
  };

  const handleOtpComplete = (value: string) => {
    handleVerifySubmit(value);
  };

  const handleBackToRegister = () => {
    setStep('register');
    setOtpCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-center">
            <img src="ifpass.png" alt="IFPASS" className="h-auto max-w-full" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'register' ? (
            <>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={emailError ? 'border-destructive' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                  {type === 'internal' && !emailError && email && (
                    <p className="text-sm text-muted-foreground">
                      Use seu e-mail institucional (@aluno.iffar.edu.br)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={type} 
                    onValueChange={(value: 'internal' | 'external') => {
                      setType(value);
                      setEmailError('');
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Interno (Aluno/Funcionário IFFAR)</SelectItem>
                      <SelectItem value="external">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading || (type === 'internal' && !!emailError)}>
                  {loading ? 'Enviando...' : 'Registrar-se'}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Fazer login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Verificação de E-mail</h2>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para <strong>{email}</strong>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-center block text-sm sm:text-base">
                      Digite o código de verificação
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        length={6}
                        value={otpCode}
                        onChange={handleOtpChange}
                        onComplete={handleOtpComplete}
                        disabled={verifying}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleVerifySubmit(otpCode)}
                    className="w-full"
                    disabled={verifying || otpCode.length !== 6}
                  >
                    {verifying ? 'Verificando...' : 'Verificar código'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToRegister}
                    className="w-full"
                    disabled={verifying}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

