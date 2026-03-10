import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Booking } from "./Booking";
import { BookingStatus } from "./BookingEnums";

@Entity("booking_timelines")
export class BookingTimeline {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Booking, booking => booking.timeline, { onDelete: "CASCADE" })
    booking!: Booking;

    @Column({ type: "enum", enum: BookingStatus })
    statusReached!: BookingStatus;

    @Column({ type: "text", nullable: true })
    description!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
