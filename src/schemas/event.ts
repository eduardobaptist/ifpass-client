import { z } from 'zod';

// Schema de validação para criar evento
export const createEventSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  type: z.enum(['internal', 'external'], {
    required_error: 'Selecione o tipo do evento',
  }),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  date: z.string().min(1, 'A data é obrigatória'),
  location: z.string().min(3, 'O local deve ter pelo menos 3 caracteres'),
  capacity: z
    .number()
    .min(1, 'A capacidade deve ser pelo menos 1')
    .int('A capacidade deve ser um número inteiro'),
});

// Schema de validação para editar evento (mesmo schema, pode ter campos opcionais se necessário)
export const editEventSchema = createEventSchema;

// Tipos inferidos dos schemas
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type EditEventFormData = z.infer<typeof editEventSchema>;

