import { z } from 'zod'

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<
  | { success: true; data: z.infer<TSchema> }
  | { success: false; error: string }
> {
  try {
    const json = await request.json()
    const result = schema.safeParse(json)

    if (!result.success) {
      const firstIssue = result.error.issues[0]
      return {
        success: false,
        error: firstIssue?.message || 'Ongeldige aanvraagdata',
      }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      error: 'Ongeldige JSON body',
    }
  }
}
