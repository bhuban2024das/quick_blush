import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Vendor } from "./Vendor";
import { SubscriptionPlan } from "./SubscriptionPlan";

export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

@Entity("vendor_subscriptions")
export class VendorSubscription {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Vendor, { eager: true, onDelete: "CASCADE" })
    vendor!: Vendor;

    @ManyToOne(() => SubscriptionPlan, { eager: true, onDelete: "RESTRICT" })
    plan!: SubscriptionPlan;

    @Column({ type: "timestamp" })
    startDate!: Date;

    @Column({ type: "timestamp" })
    endDate!: Date;

    @Column({ type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
    status!: SubscriptionStatus;

    @Column({ type: "boolean", default: true })
    paymentCollected!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
