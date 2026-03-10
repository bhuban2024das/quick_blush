import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Vendor } from "./Vendor";
import { Service } from "./Service";
import { BookingAddon } from "./BookingAddon";
import { BookingTimeline } from "./BookingTimeline";

import { BookingStatus, PaymentStatus } from "./BookingEnums";

export { BookingStatus, PaymentStatus };

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
    user!: User;

    @ManyToOne(() => Vendor, { eager: true, nullable: true, onDelete: "SET NULL" })
    vendor!: Vendor | null;

    @ManyToOne(() => Service, { eager: true, nullable: true })
    service!: Service;

    @Column({ type: "date" })
    scheduledDate!: string;

    @Column({ type: "time" })
    scheduledTime!: string;

    @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING_PAYMENT })
    status!: BookingStatus;

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus!: PaymentStatus;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalAmount!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    tipAmount!: number;

    @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
    lat!: number;

    @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
    lng!: number;

    @Column({ type: "text" })
    address!: string;

    @Column({ type: "text", nullable: true })
    customerNotes!: string;

    @OneToMany(() => BookingAddon, addon => addon.booking, { cascade: true })
    addons!: BookingAddon[];

    @OneToMany(() => BookingTimeline, timeline => timeline.booking, { cascade: true })
    timeline!: BookingTimeline[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
