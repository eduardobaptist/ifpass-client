import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotAuthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-5xl font-bold text-destructive">403</CardTitle>
          <CardDescription className="text-xl mt-4">
            Acesso não autorizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/eventos">
              <Button variant="outline">Voltar para eventos</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

