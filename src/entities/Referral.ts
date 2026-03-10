import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum ReferralStatus {
    PENDING = "PENDING",    // User registered but hasn't booked yet
    COMPLETED = "COMPLETED" // User completed first booking, reward given
}

@Entity("referrals")
export class Referral {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    // User who shared the code
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    referrer!: User;

    // User who signed up using the code
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    referred!: User;

    @Column({ type: "varchar", length: 50 })
    referralCode!: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    rewardAmount!: number;

    @Column({ type: "enum", enum: ReferralStatus, default: ReferralStatus.PENDING })
    status!: ReferralStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
