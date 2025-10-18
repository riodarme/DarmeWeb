export {};

declare module "midtrans-client" {
  export interface TransactionStatus {
    transaction_id: string;
    order_id: string;
    transaction_status: string;
    payment_type: string;
    gross_amount: number | string;
    transaction_time: string;
    settlement_time?: string;
    fraud_status?: string;
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
    actions?: {
      name: string;
      url: string;
    }[];
    qr_string?: string;
    payment_code?: string;
    status_code?: string;
  }

  export interface RefundParams {
    refund_amount: number;
    reason?: string;
  }

  export interface MidtransNotification {
    transaction_status: string;
    fraud_status?: string;
    order_id: string;
    payment_type: string;
    status_code: string;
    status_message?: string;
    settlement_time?: string;
    transaction_time?: string;
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
  }

  export type NotificationBody = Partial<MidtransNotification>;

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string; // tetap opsional, bisa diabaikan kalau tidak pakai
    });

    // 🔹 Semua transaksi langsung lewat CoreApi
    status(orderId: string): Promise<TransactionStatus>;
    cancel(orderId: string): Promise<TransactionStatus>;
    expire(orderId: string): Promise<TransactionStatus>;
    approve(orderId: string): Promise<TransactionStatus>;
    refund(orderId: string, params: RefundParams): Promise<TransactionStatus>;
    charge(params: Record<string, unknown>): Promise<TransactionStatus>;
    capture(params: Record<string, unknown>): Promise<TransactionStatus>;
    notification(body: NotificationBody): Promise<MidtransNotification>;
  }
}
