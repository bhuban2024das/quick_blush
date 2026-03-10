import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED"
}

@Entity("promo_codes")
export class PromoCode {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 50, unique: true })
    code!: string;

    @Column({ type: "varchar", length: 255 })
    description!: string;

    @Column({ type: "enum", enum: DiscountType, default: DiscountType.PERCENTAGE })
    discountType!: DiscountType;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    discountValue!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    minOrderValue!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    maxDiscountAmount!: number;

    @Column({ type: "int", default: 0 })
    usageLimit!: number; // 0 = unlimited

    @Column({ type: "int", default: 0 })
    usedCount!: number;

    @Column({ type: "timestamp" })
    validFrom!: Date;

    @Column({ type: "timestamp" })
    validUntil!: Date;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
