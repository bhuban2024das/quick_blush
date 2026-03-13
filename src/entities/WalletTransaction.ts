import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Wallet } from "./Wallet";
import { Transaction } from "./Transaction"; // If related to a system-wide tx

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

@Entity("wallet_transactions")
export class WalletTransaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;


 

    @ManyToOne(() => Wallet, { onDelete: "CASCADE" })
    wallet!: Wallet;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    amount!: number;

    @Column({ type: "enum", enum: TransactionType })
    type!: TransactionType;

    @Column({ type: "varchar", length: 255 })
    description!: string;

    // Optional relation to global transaction ID or Booking ID
    @Column({ type: "varchar", length: 255, nullable: true })
    referenceId!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
