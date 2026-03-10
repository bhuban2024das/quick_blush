import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum BillingCycle {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY"
}

@Entity("subscription_plans")
export class SubscriptionPlan {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ type: "enum", enum: BillingCycle, default: BillingCycle.MONTHLY })
    billingCycle!: BillingCycle;

    @Column({ type: "int" })
    validityDays!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    basePrice!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    taxPercentage!: number;

    @Column({ type: "int", nullable: true })
    maxDailyBookings!: number; // optional limit

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
