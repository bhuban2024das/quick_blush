import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

export enum EntityType {
    USER = "USER",
    VENDOR = "VENDOR"
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: EntityType })
    entityType!: EntityType;

    @Column({ type: "uuid" })
    entityId!: string; // ID of either user or vendor

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: "enum", enum: TransactionType })
    type!: TransactionType;

    @Column({ type: "varchar", length: 255 })
    description!: string;

    @Column({ type: "varchar", nullable: true })
    referenceId!: string; // E.g., booking ID or purchase ID

    @CreateDateColumn()
    createdAt!: Date;
}
