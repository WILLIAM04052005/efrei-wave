interface StatusMessageProps {
  status: 'loading' | 'error'
  message?: string
  onRetry?: () => void
}

function StatusMessage({ status, message, onRetry }: StatusMessageProps) {
  if (status === 'loading') {
    return (
      <p className="status-message" role="status">
        <span className="spinner" aria-hidden="true" />
        Chargement…
      </p>
    )
  }

  return (
    <div className="status-message status-message--error" role="alert">
      <p>
        <strong>Le chargement a échoué.</strong> {message}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  )
}

export default StatusMessage