import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, User, Award, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ValidationResult {
  valid: boolean;
  certificate?: {
    id: number;
    certificateNumber: string;
    issuedAt: string;
    verifiedAt: string | null;
    verificationCount: number;
  };
  event?: {
    id: number;
    name: string;
    type: 'internal' | 'external';
    description: string;
    date: string;
    location: string;
  };
  subscription?: {
    id: number;
    status: string;
    checkedInAt: string | null;
    createdAt: string;
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
    type: 'internal' | 'external';
  };
  message?: string;
}

export default function ValidateCertificate() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error('Por favor, insira um token de validação');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/certificates/validate', { token: token.trim() });
      setResult(response.data);
      
      if (response.data.valid) {
        toast.success('Certificado válido!');
      } else {
        toast.error(response.data.message || 'Certificado inválido');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao validar certificado';
      setResult({
        valid: false,
        message,
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const str: string = new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Validação de Certificado</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verifique a autenticidade de qualquer certificado emitido pelo sistema usando o token de validação
          </p>
        </div>

        {/* Validation Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Validar Certificado
            </CardTitle>
            <CardDescription>
              Cole o token de validação do certificado abaixo para verificar suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-base font-medium">
                  Token de Validação
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o token do certificado aqui"
                  className="font-mono text-sm h-12"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  O token pode ser encontrado no certificado emitido
                </p>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Validar Certificado
                  </>
                )}
              </Button>
            </form>

            {/* Result Card */}
            {result && (
              <Card className={result.valid ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {result.valid ? (
                      <>
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-green-600 dark:text-green-400">
                            Certificado Válido
                          </CardTitle>
                          {result.message && (
                            <CardDescription className="text-green-700 dark:text-green-300">
                              {result.message}
                            </CardDescription>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <CardTitle className="text-red-600 dark:text-red-400">
                            Certificado Inválido
                          </CardTitle>
                          {result.message && (
                            <CardDescription className="text-red-700 dark:text-red-300">
                              {result.message}
                            </CardDescription>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>

                {result.valid && (
                  <CardContent className="space-y-4 pt-4">
                    {/* Nome do Participante */}
                    {result.user && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Participante
                          </p>
                          <p className="font-semibold text-base">{result.user.fullName}</p>
                        </div>
                      </div>
                    )}

                    {/* Número do Certificado */}
                    {result.certificate && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Número do Certificado
                          </p>
                          <p className="font-mono text-sm font-semibold">
                            {result.certificate.certificateNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Data de Emissão do Certificado */}
                    {result.certificate && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Data de Emissão
                          </p>
                          <p className="font-medium">{formatDate(result.certificate.issuedAt)}</p>
                        </div>
                      </div>
                    )}

                    {/* Nome do Evento */}
                    {result.event && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Evento
                          </p>
                          <p className="font-semibold text-base">{result.event.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Data do Evento */}
                    {result.event && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Data do Evento
                          </p>
                          <p className="font-medium">{formatDate(result.event.date)}</p>
                        </div>
                      </div>
                    )}

                    {/* Localização do Evento */}
                    {result.event && (
                      <div className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Localização
                          </p>
                          <p className="font-medium">{result.event.location}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? Entre em contato com o suporte
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/registro"
              className="text-primary hover:underline font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}