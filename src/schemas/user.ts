import { z } from 'zod';

// Schema de validação para criar usuário
export const createUserSchema = z.object({
  fullName: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  type: z.enum(['internal', 'external'], {
    required_error: 'Selecione o tipo de usuário',
  }),
  role: z.enum(['admin', 'organizer', 'user'], {
    required_error: 'Selecione a função do usuário',
  }),
});

// Schema de validação para editar usuário (senha é opcional)
export const editUserSchema = z.object({
  fullName: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 6,
      'A senha deve ter pelo menos 6 caracteres'
    ),
  type: z.enum(['internal', 'external'], {
    required_error: 'Selecione o tipo de usuário',
  }),
  role: z.enum(['admin', 'organizer', 'user'], {
    required_error: 'Selecione a função do usuário',
  }),
});

// Tipos inferidos dos schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;

