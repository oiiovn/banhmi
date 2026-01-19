'use client'

import { DebtTransfer } from '@/lib/api/agent'
import { formatCurrency, formatDate } from './utils'

interface PendingTransfersProps {
  transfers: DebtTransfer[]
  onConfirm: (transferId: number) => void
  onReject: (transferId: number) => void
}

export default function PendingTransfers({ 
  transfers, 
  onConfirm, 
  onReject 
}: PendingTransfersProps) {
  if (transfers.length === 0) return null

  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-1">
        <span>📩</span> Yêu cầu bù trừ công nợ ({transfers.length})
      </h2>
      <div className="space-y-3">
        {transfers.map((transfer) => {
          const { party_a_name, party_b_name, a_owed_before, b_owed_before, 
                  offset_amount, a_owed_after, b_owed_after, 
                  needs_my_confirmation, is_initiator } = transfer
          
          // Xác định người gửi và người nhận thư
          const senderName = party_a_name // Người gửi yêu cầu (initiator)
          const receiverName = party_b_name // Người nhận yêu cầu
          const currentUserIsReceiver = needs_my_confirmation
          
          return (
            <div key={transfer.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Header - Tiêu đề thư */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">
                    Yêu cầu bù trừ công nợ giữa {senderName} và {receiverName}
                  </h3>
                  {currentUserIsReceiver ? (
                    <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded font-medium">
                      Cần xác nhận
                    </span>
                  ) : (
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded">
                      Đã gửi
                    </span>
                  )}
                </div>
                <p className="text-purple-200 text-xs mt-1">{formatDate(transfer.created_at)}</p>
              </div>

              {/* Nội dung thư */}
              <div className="p-4 text-sm text-gray-700 space-y-4">
                {/* Lời chào */}
                <p>
                  Chào <span className="font-semibold">{receiverName}</span>,
                </p>
                
                <p className="text-gray-600">
                  Hiện tại giữa <span className="font-medium">{senderName}</span> và <span className="font-medium">{receiverName}</span> đang có công nợ hai chiều như sau:
                </p>

                {/* Công nợ hiện tại */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <span>📌</span> Công nợ hiện tại
                  </p>
                  <ul className="space-y-1 text-sm ml-1">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      <span><span className="font-medium">{senderName}</span> đang nợ {receiverName}:</span>
                      <span className="font-bold text-red-600">{formatCurrency(a_owed_before)} đ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">•</span>
                      <span><span className="font-medium">{receiverName}</span> đang nợ {senderName}:</span>
                      <span className="font-bold text-green-600">{formatCurrency(b_owed_before)} đ</span>
                    </li>
                  </ul>
                </div>

                {/* Đề xuất bù trừ */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="font-semibold text-purple-800 mb-2 flex items-center gap-1">
                    <span>🔄</span> Đề xuất bù trừ công nợ
                  </p>
                  <ul className="space-y-1 text-sm ml-1 text-purple-700">
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span>Số tiền đề xuất bù trừ:</span>
                      <span className="font-bold text-purple-600 text-base">{formatCurrency(offset_amount)} đ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span className="text-gray-600">Khoản bù trừ này sẽ được trừ đồng thời vào hai công nợ tương ứng.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span className="text-gray-600">Không phát sinh giao dịch tiền mặt hay chuyển khoản.</span>
                    </li>
                  </ul>
                </div>

                {/* Kết quả sau bù trừ */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
                    <span>✅</span> Kết quả sau khi bù trừ
                  </p>
                  <ul className="space-y-1 text-sm ml-1">
                    <li className="flex items-center gap-2">
                      <span className={a_owed_after === 0 ? 'text-green-500' : 'text-orange-500'}>•</span>
                      <span><span className="font-medium">{senderName}</span> {a_owed_after === 0 ? 'sẽ hết nợ' : 'còn nợ'} {receiverName}:</span>
                      <span className={`font-bold ${a_owed_after === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(a_owed_after)} đ {a_owed_after === 0 && '✓'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={b_owed_after === 0 ? 'text-green-500' : 'text-orange-500'}>•</span>
                      <span><span className="font-medium">{receiverName}</span> {b_owed_after === 0 ? 'sẽ hết nợ' : 'còn nợ'} {senderName}:</span>
                      <span className={`font-bold ${b_owed_after === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(b_owed_after)} đ {b_owed_after === 0 && '✓'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Lời nhắn */}
                <p className="text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <span className="text-yellow-600">👉</span> Nếu bạn đồng ý với phương án bù trừ công nợ trên, vui lòng <span className="font-semibold text-green-600">xác nhận yêu cầu</span> để hệ thống ghi nhận và cập nhật công nợ cho cả hai bên.
                </p>

                {/* Ghi chú nếu có */}
                {transfer.description && (
                  <p className="text-gray-500 text-xs italic">
                    📝 Ghi chú: {transfer.description}
                  </p>
                )}

                {/* Chữ ký */}
                <div className="text-gray-600 pt-2 border-t border-gray-100">
                  <p>Trân trọng,</p>
                  <p className="font-semibold text-gray-800">{senderName}</p>
                </div>
              </div>

              {/* Nút hành động */}
              {currentUserIsReceiver && (
                <div className="px-4 pb-4 flex gap-3">
                  <button
                    onClick={() => onConfirm(transfer.id)}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold shadow-sm"
                  >
                    ✓ Xác nhận bù trừ
                  </button>
                  <button
                    onClick={() => onReject(transfer.id)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium border border-gray-300"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
