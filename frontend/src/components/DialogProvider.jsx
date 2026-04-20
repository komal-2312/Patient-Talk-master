import React, { createContext, useContext, useState, useCallback } from "react";
import "./DialogProvider.css";

const DialogContext = createContext();

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  const showDialog = useCallback((message, onConfirm = null) => {
    setDialogState({
      isOpen: true,
      message,
      onConfirm,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      {dialogState.isOpen && (
        <div className="global-dialog-overlay" onClick={closeDialog}>
          <div className="global-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="global-dialog-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="global-dialog-title">System Message</h3>
            <p className="global-dialog-message">{dialogState.message}</p>
            <div className="global-dialog-actions">
              <button className="global-dialog-btn" onClick={handleConfirm}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export const useDialog = () => useContext(DialogContext);
