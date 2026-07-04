// Styled after ios-ipados-26-design-system/components/overlays/Alert.jsx
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  // single-button info alert when there's no cancel action
  const singleButton = !onCancel;

  return (
    <div className="modal-overlay" onClick={onCancel || onConfirm}>
      <div className="alert-card" onClick={(e) => e.stopPropagation()}>
        <div className="alert-body">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-message">{message}</div>
        </div>
        <div className="alert-actions">
          {!singleButton && <button onClick={onCancel}>{cancelText}</button>}
          <button
            className="alert-confirm"
            style={destructive ? { color: "var(--tint-destructive)" } : undefined}
            onClick={onConfirm || onCancel}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
