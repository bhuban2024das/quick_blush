import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Vendor } from "./Vendor";
import { Booking } from "./Booking";
import { Service } from "./Service";

export enum ReviewType {
    USER_TO_VENDOR = "USER_TO_VENDOR",
    VENDOR_TO_USER = "VENDOR_TO_USER"
}

@Entity("ratings_reviews")
export class RatingReview {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Booking, { onDelete: "CASCADE" })
    booking!: Booking;

    @Column({ type: "enum", enum: ReviewType })
    reviewType!: ReviewType;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user!: User;

    @ManyToOne(() => Vendor, { onDelete: "CASCADE" })
    vendor!: Vendor;

    @ManyToOne(() => Service, { nullable: true, onDelete: "SET NULL" })
    service!: Service;

    @Column({ type: "int" })
    rating!: number; // 1 to 5 scale

    @Column({ type: "text", nullable: true })
    comment!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
