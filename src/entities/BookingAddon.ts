import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Booking } from "./Booking";

@Entity("booking_addons")
export class BookingAddon {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Booking, booking => booking.addons, { onDelete: "CASCADE" })
    booking!: Booking;

    @Column({ type: "varchar", length: 100 })
    addonName!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price!: number;
}

