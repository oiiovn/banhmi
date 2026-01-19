'use client'

import { useAuthStore } from '@/lib/store/authStore'
import { useAgentDebts } from '@/lib/hooks/useAgentDebts'
import AgentHeader from '@/components/AgentHeader'
import Modal from '@/components/Modal'
import { Toast } from '@/components/Toast'
import {
  DebtStats,
  PendingPayments,
  PendingTransfers,
  DebtList,
  DebtDetailModal,
  OffsetModal,
} from '@/components/agent/debts'

export default function AgentDebtsPage() {
  const { user } = useAuthStore()
  const {
    // Data
    debts,
    stats,
    pendingPayments,
    pendingDebtTransfers,
    selectedDebt,
    
    // Loading & Error states
    loading,
    error,
    renderError,
    isHydrated,
    
    // Modal states
    modal,
    
    // Offset Modal states
    showOffsetModal,
    offsetCurrentDebt,
    offsetOppositeDebt,
    isSubmittingOffset,
    isLoadingOpposite,
    canOffset,
    
    // Toast states
    toasts,
    removeToast,
    
    // Actions
    fetchData,
    setSelectedDebt,
    setModal,
    setRenderError,
    
    // Handlers
    handleConfirmPayment,
    handleRejectPayment,
    handleConfirmTransfer,
    handleRejectTransfer,
    handleViewDebtDetail,
    
    // Offset handlers
    handleOpenOffsetModal,
    handleCloseOffsetModal,
    handleSubmitOffset,
  } = useAgentDebts()

  // Tính toán các trạng thái hiển thị
  const showHydrationLoading = !isHydrated
  const showInitialLoading = isHydrated && loading && debts.length === 0 && !renderError
  const showRenderError = isHydrated && renderError
  const showMainContent = isHydrated && !renderError && !(loading && debts.length === 0)

  // Loading khi hydration
  if (showHydrationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Error view
  if (showRenderError) {
    return (
      <>
        <AgentHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Lỗi hiển thị trang</h2>
            <p className="text-red-700 mb-4">{renderError?.message}</p>
            <pre className="bg-red-100 p-4 rounded text-xs overflow-auto max-h-64">
              {renderError?.stack}
            </pre>
            <button
              onClick={() => {
                setRenderError(null)
                window.location.reload()
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </>
    )
  }

  // Initial loading
  if (showInitialLoading) {
    return (
      <>
        <AgentHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-white">
      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
      
      {showMainContent && (
        <>
          <AgentHeader />
          <div className="container mx-auto px-4 py-4 pb-20">
            {/* Statistics Cards */}
            <DebtStats stats={stats} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">Lỗi tải dữ liệu</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={fetchData}
                      className="mt-3 text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Payments Section */}
            <PendingPayments
              payments={pendingPayments}
              onConfirm={handleConfirmPayment}
              onReject={handleRejectPayment}
            />

            {/* Pending Debt Transfers Section */}
            <PendingTransfers
              transfers={pendingDebtTransfers}
              onConfirm={handleConfirmTransfer}
              onReject={handleRejectTransfer}
            />

            {/* Debts List - với nút Bù trừ trong từng item */}
            <DebtList
              debts={debts}
              loading={loading}
              error={error}
              onViewDetail={handleViewDebtDetail}
              onOffset={handleOpenOffsetModal}
              onRetry={fetchData}
            />
          </div>

          {/* Debt Detail Modal */}
          <DebtDetailModal
            debt={selectedDebt}
            onClose={() => setSelectedDebt(null)}
          />

          {/* Offset Modal - Modal bù trừ theo từng công nợ cụ thể */}
          <OffsetModal
            isOpen={showOffsetModal}
            currentDebt={offsetCurrentDebt}
            oppositeDebt={offsetOppositeDebt}
            isSubmitting={isSubmittingOffset}
            isLoading={isLoadingOpposite}
            canOffset={canOffset}
            onClose={handleCloseOffsetModal}
            onSubmit={handleSubmitOffset}
          />

          {/* Modal */}
          <Modal
            isOpen={modal.isOpen}
            onClose={() => setModal({ ...modal, isOpen: false })}
            type={modal.type}
            title={modal.title}
            message={modal.message}
            onConfirm={modal.onConfirm}
            confirmText={modal.confirmText}
            cancelText={modal.cancelText}
          />
        </>
      )}
    </div>
  )
}
