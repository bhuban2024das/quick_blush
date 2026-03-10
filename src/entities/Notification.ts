import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Vendor } from "./Vendor";

export enum NotificationType {
    INFO = "INFO",
    BOOKING = "BOOKING",
    PAYMENT = "PAYMENT",
    PROMO = "PROMO",
    SYSTEM = "SYSTEM"
}

@Entity("notifications")
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
    user!: User;

    @ManyToOne(() => Vendor, { nullable: true, onDelete: "CASCADE" })
    vendor!: Vendor;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text" })
    message!: string;

    @Column({ type: "enum", enum: NotificationType, default: NotificationType.INFO })
    type!: NotificationType;

    @Column({ type: "boolean", default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
