"use client"

import { Button } from "./Button"

interface ModalProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function Modal({ open, title, message, confirmText = "Да", cancelText = "Отмена", onConfirm, onCancel }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-light p-8 text-center">
        <h2 className="mb-3 text-2xl font-bold">{title}</h2>
        <p className="mb-8 text-gray-300">{message}</p>
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
