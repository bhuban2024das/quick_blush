import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Vendor } from "./Vendor";
import { ProductKit } from "./ProductKit";

export enum PurchasePaymentMode {
    PAY_NOW = "PAY_NOW",
    DEDUCT_FROM_PAYOUT = "DEDUCT_FROM_PAYOUT"
}

export enum PurchaseStatus {
    PENDING = "PENDING",    // If deduct from payout & not yet deducted
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}

@Entity("vendor_purchases")
export class VendorPurchase {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Vendor, { eager: true, onDelete: "CASCADE" })
    vendor!: Vendor;

    @ManyToOne(() => ProductKit, { eager: true, onDelete: "RESTRICT" })
    kit!: ProductKit;

    @Column({ type: "int", default: 1 })
    quantity!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({ type: "enum", enum: PurchasePaymentMode })
    paymentMode!: PurchasePaymentMode;

    @Column({ type: "enum", enum: PurchaseStatus, default: PurchaseStatus.PENDING })
    status!: PurchaseStatus;

    @Column({ type: "varchar", nullable: true })
    invoiceUrl!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
