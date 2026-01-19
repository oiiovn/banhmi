import { Debt, DebtStats, Payment, DebtTransfer } from '@/lib/api/agent'

export interface ModalState {
  isOpen: boolean
  type: 'alert' | 'confirm'
  title?: string
  message: string
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export interface TransferFormState {
  from_debt_id: number | null
  to_debt_id: number | null
  amount: string
  description: string
}

export interface UseAgentDebtsReturn {
  // Data
  debts: Debt[]
  stats: DebtStats | null
  pendingPayments: Payment[]
  pendingDebtTransfers: DebtTransfer[]
  selectedDebt: Debt | null
  
  // Loading & Error states
  loading: boolean
  error: string | null
  renderError: Error | null
  isHydrated: boolean
  
  // Modal states
  modal: ModalState
  showTransferModal: boolean
  transferForm: TransferFormState
  isSubmittingTransfer: boolean
  
  // Actions
  fetchData: () => Promise<void>
  setSelectedDebt: (debt: Debt | null) => void
  setModal: (modal: ModalState) => void
  setShowTransferModal: (show: boolean) => void
  setTransferForm: (form: TransferFormState) => void
  setRenderError: (error: Error | null) => void
  
  // Handlers
  handleConfirmPayment: (paymentId: number) => Promise<void>
  handleRejectPayment: (paymentId: number) => Promise<void>
  handleCreateTransfer: () => Promise<void>
  handleConfirmTransfer: (transferId: number) => Promise<void>
  handleRejectTransfer: (transferId: number) => Promise<void>
  handleViewDebtDetail: (debt: Debt) => Promise<void>
}
