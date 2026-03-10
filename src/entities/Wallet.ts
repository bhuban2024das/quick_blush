import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Vendor } from "./Vendor";

@Entity("wallets")
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    user!: User;

    @OneToOne(() => Vendor, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    vendor!: Vendor;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    balance!: number;

    // e.g. "INR"
    @Column({ type: "varchar", length: 10, default: "INR" })
    currency!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
