import { NextResponse } from 'next/server'

type ApiSuccessPayload<T> = {
  success: true
} & T

type ApiErrorPayload = {
  success: false
  error: string
}

export function apiSuccess<T extends Record<string, unknown>>(
  payload: T,
  init?: ResponseInit
) {
  return NextResponse.json<ApiSuccessPayload<T>>(
    {
      success: true,
      ...payload,
    },
    init
  )
}

export function apiError(
  message: string,
  status = 400,
  init?: ResponseInit,
  details?: Record<string, unknown>
) {
  return NextResponse.json<ApiErrorPayload & Record<string, unknown>>(
    {
      success: false,
      error: message,
      ...(details || {}),
    },
    {
      ...init,
      status,
    }
  )
}

export function getErrorMessage(error: unknown, fallback = 'Onbekende fout'): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
