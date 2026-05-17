import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';

interface PaymentMethodRow extends RowDataPacket {
  id: string;
  name: string;
  description: string;
}

export async function listEnabledPaymentMethods() {
  const [rows] = await pool.execute<PaymentMethodRow[]>(
    `SELECT id, name, description
     FROM payment_gateways
     WHERE enabled = TRUE
     ORDER BY FIELD(id, 'vnpay', 'momo', 'stripe'), name`,
  );
  return rows;
}
