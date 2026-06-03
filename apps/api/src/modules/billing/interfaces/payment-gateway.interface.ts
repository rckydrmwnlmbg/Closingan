export interface InvoiceResult {
  invoiceId: string;
  paymentUrl: string;
}

export interface PaymentGatewayService {
  createInvoice(
    tenantId: string,
    subscriptionId: string,
    amount: number,
    description: string,
  ): Promise<InvoiceResult>;
  processPayment(invoiceId: string): Promise<void>;
  handleWebhook(payload: any, signature: string): Promise<void>;
}
