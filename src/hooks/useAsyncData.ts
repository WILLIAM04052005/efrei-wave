import { useEffect, useState } from 'react'
import { isAbortError } from '../services/api'

// Les trois états d'un chargement : un seul à la fois, jamais de page blanche.
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

interface Settled<A, T> {
  arg: A
  attempt: number
  state: Exclude<AsyncState<T>, { status: 'loading' }>
}

// Charge « load(arg) » et la recharge quand arg change (par exemple l'id de l'URL).
export function useAsyncData<A, T>(
  load: (arg: A, signal: AbortSignal) => Promise<T>,
  arg: A,
) {
  const [attempt, setAttempt] = useState(0)
  // Le dernier résultat reçu, avec la demande (arg + attempt) à laquelle il répond.
  const [settled, setSettled] = useState<Settled<A, T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    load(arg, controller.signal)
      .then((data) => setSettled({ arg, attempt, state: { status: 'success', data } }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return // annulée par le nettoyage : on ignore
        setSettled({
          arg,
          attempt,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Erreur inattendue.',
          },
        })
      })

    // Nettoyage : si arg change (ou si on quitte la page), on annule la requête.
    return () => controller.abort()
  }, [load, arg, attempt])

  // « Chargement » n'est pas stocké : c'est le cas où le dernier résultat reçu
  // ne répond pas à la demande actuelle (autre id, ou nouvel essai).
  const state: AsyncState<T> =
    settled && settled.arg === arg && settled.attempt === attempt
      ? settled.state
      : { status: 'loading' }

  function retry() {
    setAttempt((current) => current + 1)
  }

  return { state, retry }
}